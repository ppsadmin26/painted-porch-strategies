import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

function ghlHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Version: GHL_VERSION,
  };
}

function todayForGHL(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Phoenix" });
}

const GHL_FIELD_IDS = {
  status: "Jyw2gDBVh3Y0RsaXUpBd",
  contact_source: "A28bKAM3DFGCczH7ck28",
  first_contact_date: "410RQnsoOeKEcmKVJw7i",
};

const BURNOUT_WORKFLOW_ID = "8f4fa356-a9ce-44b7-8668-000f9c105b06";
const SITE_URL = "https://onthepaintedporch.com";

// Generate HMAC-SHA256 access token from email
async function generateAccessToken(email: string): Promise<string> {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "fallback";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(`burnout-access:${email.toLowerCase().trim()}`));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle token verification requests
  if (req.method === "GET") {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const email = url.searchParams.get("email");

    if (!token || !email) {
      return new Response(JSON.stringify({ valid: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expected = await generateAccessToken(email);
    const valid = token === expected;

    return new Response(JSON.stringify({ valid }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return new Response(JSON.stringify({ error: "name and email are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GHL_API_KEY");
    if (!apiKey) throw new Error("GHL_API_KEY not configured");

    const locationId = Deno.env.get("GHL_LOCATION_ID");
    if (!locationId) throw new Error("GHL_LOCATION_ID not configured");

    // Parse name into first/last
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const tags = ["burnout_optin", "newsletter"];

    // ── 1. Upsert GHL Contact ──
    const searchRes = await fetch(
      `${GHL_BASE}/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(email.trim())}`,
      { method: "GET", headers: ghlHeaders(apiKey) }
    );

    let contactId: string;

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData?.contact?.id) {
        contactId = searchData.contact.id;
        const updateBody = {
          firstName,
          lastName,
          tags,
          dnd: false,
          dndSettings: { Email: { status: "active" } },
          customFields: [
            { id: GHL_FIELD_IDS.contact_source, field_value: "Burnout Opt-In" },
          ],
        };
        const updateRes = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
          method: "PUT",
          headers: ghlHeaders(apiKey),
          body: JSON.stringify(updateBody),
        });
        if (!updateRes.ok) {
          const errText = await updateRes.text();
          console.error("GHL contact update error:", updateRes.status, errText);
          throw new Error(`Failed to update contact: ${updateRes.status}`);
        }
        console.log("Contact updated:", contactId);
      } else {
        const createData = await createGHLContact(apiKey, locationId, firstName, lastName, email, tags);
        contactId = createData.contact.id;
      }
    } else {
      const createData = await createGHLContact(apiKey, locationId, firstName, lastName, email, tags);
      contactId = createData.contact.id;
    }

    // ── 2. Add to Burnout Opt-In workflow ──
    const workflowRes = await fetch(
      `${GHL_BASE}/contacts/${contactId}/workflow/${BURNOUT_WORKFLOW_ID}`,
      { method: "POST", headers: ghlHeaders(apiKey) }
    );
    if (workflowRes.ok) {
      console.log("Contact added to Burnout Opt-In workflow");
    } else {
      const errText = await workflowRes.text();
      console.error("GHL workflow enrollment error:", workflowRes.status, errText);
    }

    // ── 3. Generate access token and send email ──
    const accessToken = await generateAccessToken(email.trim());
    const accessUrl = `${SITE_URL}/burnout-access?access=${accessToken}&email=${encodeURIComponent(email.trim().toLowerCase())}`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const idempotencyKey = `burnout-access-${email.trim().toLowerCase()}-${todayForGHL()}`;

    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "burnout-access",
        recipientEmail: email.trim(),
        idempotencyKey,
        templateData: {
          firstName,
          accessUrl,
        },
      },
    });

    console.log("Burnout access email queued for:", email);

    return new Response(JSON.stringify({ success: true, contactId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Burnout opt-in error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function createGHLContact(
  apiKey: string,
  locationId: string,
  firstName: string,
  lastName: string,
  email: string,
  tags: string[]
) {
  const createBody = {
    locationId,
    firstName,
    lastName,
    email: email.trim(),
    tags,
    source: "Burnout Opt-In",
    dnd: false,
    dndSettings: { Email: { status: "active" } },
    customFields: [
      { id: GHL_FIELD_IDS.status, field_value: "New" },
      { id: GHL_FIELD_IDS.contact_source, field_value: "Burnout Opt-In" },
      { id: GHL_FIELD_IDS.first_contact_date, field_value: todayForGHL() },
    ],
  };

  const createRes = await fetch(`${GHL_BASE}/contacts/`, {
    method: "POST",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify(createBody),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    console.error("GHL contact create error:", createRes.status, errText);
    throw new Error(`Failed to create contact: ${createRes.status}`);
  }

  const data = await createRes.json();
  console.log("Contact created:", data.contact.id);
  return data;
}
