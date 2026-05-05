import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
const SITE_BASE = "https://onthepaintedporch.com";
const SLOT_KEY = "pilot-training";
const WATCH_PATH = "/pilot-training-watch";
const TEMPLATE_NAME = "pilot-training-replay";
const SOURCE_LABEL = "Passenger to Pilot Replay";
const TAGS = ["Passenger to Pilot Replay", "newsletter"];

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    const cleanEmail = String(email).trim().toLowerCase();
    const nameParts = String(name).trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // ── Generate magic-link access token ──
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: tokenRow, error: tokenErr } = await supabase
      .from("access_tokens")
      .insert({ email: cleanEmail, slot_key: SLOT_KEY })
      .select("token")
      .single();

    if (tokenErr) {
      console.error("Token insert failed:", tokenErr);
    }

    const magicToken = tokenRow?.token as string | undefined;
    const magicLink = magicToken
      ? `${SITE_BASE}${WATCH_PATH}?token=${magicToken}`
      : `${SITE_BASE}${WATCH_PATH}`;

    // ── Upsert GHL contact ──
    const searchRes = await fetch(
      `${GHL_BASE}/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(cleanEmail)}`,
      { method: "GET", headers: ghlHeaders(apiKey) }
    );

    let contactId: string;

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData?.contact?.id) {
        contactId = searchData.contact.id;
        const updateRes = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
          method: "PUT",
          headers: ghlHeaders(apiKey),
          body: JSON.stringify({
            firstName,
            lastName,
            tags: TAGS,
            dnd: false,
            dndSettings: { Email: { status: "active" } },
            customFields: [
              { id: GHL_FIELD_IDS.contact_source, field_value: SOURCE_LABEL },
            ],
          }),
        });
        if (!updateRes.ok) {
          const errText = await updateRes.text();
          console.error("GHL contact update error:", updateRes.status, errText);
          throw new Error(`Failed to update contact: ${updateRes.status}`);
        }
      } else {
        contactId = (await createContact(apiKey, locationId, firstName, lastName, cleanEmail)).contact.id;
      }
    } else {
      contactId = (await createContact(apiKey, locationId, firstName, lastName, cleanEmail)).contact.id;
    }

    // ── Send magic-link replay email (don't fail the request if this errors) ──
    if (magicToken) {
      try {
        const emailRes = await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: TEMPLATE_NAME,
            recipientEmail: cleanEmail,
            idempotencyKey: `pilot-replay-${magicToken}`,
            templateData: { firstName, watchUrl: magicLink },
          },
        });
        if (emailRes.error) {
          console.error("Pilot replay email send failed:", emailRes.error);
        }
      } catch (sendErr) {
        console.error("Pilot replay email exception:", sendErr);
      }
    }

    return new Response(JSON.stringify({ success: true, contactId, magicLink }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Pilot Training opt-in error:", err);
    return new Response(JSON.stringify({ error: "Internal server error", details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function createContact(
  apiKey: string,
  locationId: string,
  firstName: string,
  lastName: string,
  email: string,
) {
  const createRes = await fetch(`${GHL_BASE}/contacts/`, {
    method: "POST",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({
      locationId,
      firstName,
      lastName,
      email,
      tags: TAGS,
      source: SOURCE_LABEL,
      dnd: false,
      dndSettings: { Email: { status: "active" } },
      customFields: [
        { id: GHL_FIELD_IDS.status, field_value: "New" },
        { id: GHL_FIELD_IDS.contact_source, field_value: SOURCE_LABEL },
        { id: GHL_FIELD_IDS.first_contact_date, field_value: todayForGHL() },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    console.error("GHL contact create error:", createRes.status, errText);
    throw new Error(`Failed to create contact: ${createRes.status}`);
  }
  return await createRes.json();
}
