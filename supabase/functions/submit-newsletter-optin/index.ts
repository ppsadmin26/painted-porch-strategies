import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email = (body?.email ?? "").toString().trim();
    const source = (body?.source ?? "Free Resources Newsletter").toString().trim();

    if (!email || !EMAIL_RE.test(email)) {
      return new Response(JSON.stringify({ error: "A valid email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GHL_API_KEY");
    if (!apiKey) throw new Error("GHL_API_KEY not configured");

    const locationId = Deno.env.get("GHL_LOCATION_ID");
    if (!locationId) throw new Error("GHL_LOCATION_ID not configured");

    const tags = ["newsletter", "resources_subscriber"];

    // Search for existing contact
    const searchRes = await fetch(
      `${GHL_BASE}/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(email)}`,
      { method: "GET", headers: ghlHeaders(apiKey) }
    );

    let contactId: string;

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData?.contact?.id) {
        contactId = searchData.contact.id;
        const updateBody = {
          tags,
          dnd: false,
          dndSettings: { Email: { status: "active" } },
          customFields: [
            { id: GHL_FIELD_IDS.contact_source, field_value: source },
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
        console.log("Newsletter contact updated:", contactId);
      } else {
        contactId = await createGHLContact(apiKey, locationId, email, tags, source);
      }
    } else {
      contactId = await createGHLContact(apiKey, locationId, email, tags, source);
    }

    return new Response(JSON.stringify({ success: true, contactId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Newsletter opt-in error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function createGHLContact(
  apiKey: string,
  locationId: string,
  email: string,
  tags: string[],
  source: string,
): Promise<string> {
  const createBody = {
    locationId,
    email,
    tags,
    source,
    dnd: false,
    dndSettings: { Email: { status: "active" } },
    customFields: [
      { id: GHL_FIELD_IDS.status, field_value: "New" },
      { id: GHL_FIELD_IDS.contact_source, field_value: source },
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
  console.log("Newsletter contact created:", data.contact.id);
  return data.contact.id as string;
}
