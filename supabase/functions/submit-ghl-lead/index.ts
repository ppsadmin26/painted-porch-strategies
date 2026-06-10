import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

interface GHLHeaders {
  Authorization: string;
  "Content-Type": string;
  Version: string;
}

interface GHLCustomField {
  key?: string;
  id?: string;
  field_value: string | string[];
}

function ghlHeaders(apiKey: string): GHLHeaders {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Version: GHL_VERSION,
  };
}

// ── Tag allowlist ───────────────────────────────────────────────────────
// Tags are forwarded to GHL and can trigger marketing automations, so we
// only accept a fixed set plus the dynamic `course-launch-<slug>` pattern.
const ALLOWED_TAGS = new Set<string>([
  "contact-form",
  "newsletter-opt-in",
  "Change Roadmap",
  "ChangeComms",
  "Strategic Canvas",
  "WFH Mini Course",
  "found it charity",
  "stractical-waitlist",
  "course-launch-list",
]);
const COURSE_LAUNCH_TAG = /^course-launch-[a-z0-9-]{1,64}$/;

function sanitizeTags(input: unknown): string[] {
  if (!Array.isArray(input)) return ["contact-form"];
  const cleaned = input
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && t.length <= 80)
    .filter((t) => ALLOWED_TAGS.has(t) || COURSE_LAUNCH_TAG.test(t));
  return cleaned.length > 0 ? cleaned : ["contact-form"];
}

// ── Value Mappings: Form → GHL ──────────────────────────────────────────

const INTEREST_MAP: Record<string, string> = {
  "assessments": "Assessment",
  "self-paced": "Self-Paced",
  "leadership-lab": "Leadership Lab",
  "blue-door": "Blue Door",
  "workshops": "Workshop/Deep Dive",
  "strategic-partnership": "Partnership",
  "organizational-advisory": "Organizational Advisory",
  "1on1-advisory": "Coaching (1:1)",
  "speaking": "Speaking",
  "general": "General/Other",
};

const SCOPE_MAP: Record<string, string> = {
  "Yourself": "Self",
  "Team / Department": "Team/Department",
  "Company": "Company",
  "Someone Else": "Someone Else",
};

const BUDGET_MAP: Record<string, string> = {
  "less-than-1000": "Less than $1,000",
  "1000-4999": "$1,000-$4,999",
  "5000-7999": "$5,000-$7,999",
  "8000-14999": "$8,000-$14,999",
  "15000-plus": "$15,000+",
};

const TIMELINE_MAP: Record<string, string> = {
  "specific-date": "Specific Date",
  "within-30": "Within 30 Days",
  "31-90": "31-90 Days",
  "3-6-months": "3-6 Months",
  "6-plus-months": "6+ Months",
  "unknown": "Unknown",
};

const BUDGET_AUTH_MAP: Record<string, string> = {
  "yes": "Yes",
  "no": "No",
};

function mapValues(values: string[], map: Record<string, string>): string[] {
  return values.map((v) => map[v] ?? v);
}

function mapValue(value: string, map: Record<string, string>): string {
  return map[value] ?? value;
}

function todayForGHL(): string {
  // Use America/Phoenix (no daylight saving time)
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Phoenix" });
}

// GHL Custom Field IDs (from location custom fields API)
const GHL_FIELD_IDS = {
  status: "Jyw2gDBVh3Y0RsaXUpBd",
  contact_source: "A28bKAM3DFGCczH7ck28",
  first_contact_date: "410RQnsoOeKEcmKVJw7i",
};

function buildContactCustomFields(payload: {
  setStatus?: boolean;
  setFirstContactDate?: boolean;
}): GHLCustomField[] {
  const customFields: GHLCustomField[] = [];

  if (payload.setStatus) {
    customFields.push({ id: GHL_FIELD_IDS.status, field_value: "New" });
  }

  customFields.push({ id: GHL_FIELD_IDS.contact_source, field_value: "Website Contact" });

  if (payload.setFirstContactDate) {
    const firstContactDate = todayForGHL();
    customFields.push({ id: GHL_FIELD_IDS.first_contact_date, field_value: firstContactDate });
  }

  return customFields;
}

// ── Step 1: Upsert Contact ──────────────────────────────────────────────
async function upsertContact(
  apiKey: string,
  locationId: string,
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    newsletter?: boolean;
    tags?: string[];
  }
) {
  const contactTags = [...sanitizeTags(payload.tags)];
  if (payload.newsletter) {
    contactTags.push("newsletter-opt-in");
  }

  // Search for existing contact by email
  const searchRes = await fetch(
    `${GHL_BASE}/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(payload.email)}`,
    { method: "GET", headers: ghlHeaders(apiKey) }
  );

  let existingContact: Record<string, unknown> | null = null;

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData?.contact?.id) {
      existingContact = searchData.contact;
    }
  }

  if (existingContact) {
    // Contact EXISTS — update with new info, preserve source and firstContactDate
    const contactId = existingContact.id as string;

    const updateBody: Record<string, unknown> = {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim(),
      tags: contactTags,
      customFields: buildContactCustomFields({ setStatus: false, setFirstContactDate: false }),
    };

    if (payload.phone) updateBody.phone = payload.phone.trim();
    if (payload.company) updateBody.companyName = payload.company.trim();

    if (payload.newsletter) {
      updateBody.dnd = false;
      updateBody.dndSettings = {
        Email: { status: "active" },
      };
    }

    // Only set source if existing source is blank/empty
    const existingSource = existingContact.source as string | undefined;
    if (!existingSource || existingSource.trim() === "") {
      updateBody.source = "Website Contact";
    }

    const updateRes = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
      method: "PUT",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify(updateBody),
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.error("GHL contact update error:", updateRes.status, errText);
      throw new Error(`Failed to update contact: ${updateRes.status} ${errText}`);
    }

    return { contactId, isNew: false };
  } else {
    // Contact does NOT exist — create new
    const createBody: Record<string, unknown> = {
      locationId,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim(),
      tags: contactTags,
      source: "Website Contact",
      customFields: buildContactCustomFields({ setStatus: true, setFirstContactDate: true }),
    };

    if (payload.phone) createBody.phone = payload.phone.trim();
    if (payload.company) createBody.companyName = payload.company.trim();

    if (payload.newsletter) {
      createBody.dnd = false;
      createBody.dndSettings = {
        Email: { status: "active" },
      };
    }

    const createRes = await fetch(`${GHL_BASE}/contacts/`, {
      method: "POST",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify(createBody),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("GHL contact create error:", createRes.status, errText);
      throw new Error(`Failed to create contact: ${createRes.status} ${errText}`);
    }

    const createData = await createRes.json();
    const contactId = createData?.contact?.id;
    if (!contactId) {
      throw new Error("No contact ID returned from GHL create");
    }

    return { contactId, isNew: true };
  }
}

// ── Step 2: Lookup pipeline & stage by name ─────────────────────────────
async function findPipelineAndStage(
  apiKey: string,
  locationId: string,
  pipelineName: string,
  stageName: string
): Promise<{ pipelineId: string; stageId: string }> {
  const res = await fetch(
    `${GHL_BASE}/opportunities/pipelines?locationId=${locationId}`,
    { method: "GET", headers: ghlHeaders(apiKey) }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch pipelines: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const pipelines = data?.pipelines ?? [];

  const pipeline = pipelines.find(
    (p: { name: string }) => p.name.toLowerCase() === pipelineName.toLowerCase()
  );
  if (!pipeline) {
    throw new Error(`Pipeline "${pipelineName}" not found. Available: ${pipelines.map((p: { name: string }) => p.name).join(", ")}`);
  }

  const stages = pipeline.stages ?? [];
  const stage = stages.find(
    (s: { name: string }) => s.name.toLowerCase() === stageName.toLowerCase()
  );
  if (!stage) {
    throw new Error(`Stage "${stageName}" not found in pipeline "${pipelineName}". Available: ${stages.map((s: { name: string }) => s.name).join(", ")}`);
  }

  return { pipelineId: pipeline.id, stageId: stage.id };
}

// ── Step 3: Create Opportunity ──────────────────────────────────────────
async function createOpportunity(
  apiKey: string,
  locationId: string,
  contactId: string,
  pipelineId: string,
  stageId: string,
  payload: {
    firstName: string;
    lastName: string;
    message?: string;
    interests?: string[];
    inquiryFor?: string[];
    budgetAuthority?: string;
    budgetRange?: string;
    timeline?: string;
    specificDate?: string;
    company?: string;
  }
) {
  const namePart = payload.company
    ? `${payload.company}_${payload.firstName} ${payload.lastName}`
    : `${payload.firstName} ${payload.lastName}`;
  const opportunityName = `Website Lead: ${namePart}`;

  const customFields: GHLCustomField[] = [];

  if (payload.message) {
    customFields.push({ key: "contact_form_details", field_value: payload.message });
  }
  if (payload.interests?.length) {
    customFields.push({ key: "opportunity_type", field_value: mapValues(payload.interests, INTEREST_MAP) });
  }
  if (payload.inquiryFor?.length) {
    const mapped = mapValues(
      Array.isArray(payload.inquiryFor) ? payload.inquiryFor : [payload.inquiryFor],
      SCOPE_MAP
    );
    customFields.push({ key: "opportunity_for", field_value: mapped });
  }
  if (payload.budgetAuthority) {
    customFields.push({ key: "budget_authority", field_value: mapValue(payload.budgetAuthority, BUDGET_AUTH_MAP) });
  }
  if (payload.budgetRange) {
    customFields.push({ key: "estimated_budget", field_value: mapValue(payload.budgetRange, BUDGET_MAP) });
  }
  if (payload.timeline) {
    customFields.push({ key: "estimated_timeline", field_value: mapValue(payload.timeline, TIMELINE_MAP) });
  }
  if (payload.specificDate) {
    customFields.push({ key: "timeframe_date", field_value: payload.specificDate });
  }

  const body = {
    locationId,
    pipelineId,
    pipelineStageId: stageId,
    contactId,
    name: opportunityName,
    status: "open",
    source: "Website Contact",
    customFields,
  };

  const res = await fetch(`${GHL_BASE}/opportunities/`, {
    method: "POST",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("GHL opportunity create error:", res.status, errText);
    throw new Error(`Failed to create opportunity: ${res.status} ${errText}`);
  }

  return await res.json();
}

// ── Step 4: Associate Opportunity with Company ─────────────────────────
const GHL_ASSOCIATION_ID = "69cc4bb60fa9b3bf47b68d4a";

async function findCompanyByName(
  apiKey: string,
  locationId: string,
  companyName: string
): Promise<string | null> {
  const searchUrl = `${GHL_BASE}/businesses/search?locationId=${locationId}`;
  const res = await fetch(searchUrl, {
    method: "GET",
    headers: ghlHeaders(apiKey),
  });

  if (!res.ok) {
    console.error("GHL company search error:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const businesses = data?.businesses ?? [];

  // Exact match (case-insensitive)
  const match = businesses.find(
    (b: { name: string }) => b.name.toLowerCase() === companyName.trim().toLowerCase()
  );

  return match?.id ?? null;
}

async function associateOpportunityWithCompany(
  apiKey: string,
  locationId: string,
  associationId: string,
  opportunityId: string,
  companyId: string
) {
  const body = {
    associationId,
    firstRecordId: companyId,
    secondRecordId: opportunityId,
    locationId,
  };

  const res = await fetch(`${GHL_BASE}/associations/relations`, {
    method: "POST",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("GHL association create error:", res.status, errText);
    return null;
  }

  return await res.json();
}

// ── Main handler ────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      interests,
      inquiryFor,
      message,
      budgetAuthority,
      budgetRange,
      timeline,
      specificDate,
      newsletter,
      tags,
      skipOpportunity,
    } = body;

    if (!firstName || !email) {
      return new Response(JSON.stringify({ error: "firstName and email are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GHL_API_KEY");
    if (!apiKey) {
      throw new Error("GHL_API_KEY not configured");
    }

    const locationId = Deno.env.get("GHL_LOCATION_ID");
    if (!locationId) {
      throw new Error("GHL_LOCATION_ID not configured");
    }

    // ── 1. Upsert Contact ──
    const { contactId } = await upsertContact(apiKey, locationId, {
      firstName,
      lastName,
      email,
      phone,
      company,
      newsletter,
      tags: tags ?? ["contact-form"],
    });

    console.log("Contact upserted:", contactId);

    // ── 2-4. Create Opportunity (skip if flagged, e.g. waitlist-only) ──
    if (!skipOpportunity) {
      const { pipelineId, stageId } = await findPipelineAndStage(
        apiKey,
        locationId,
        "New Lead",
        "New/Interested"
      );

      console.log("Pipeline found:", pipelineId, "Stage:", stageId);

      const opportunity = await createOpportunity(
        apiKey,
        locationId,
        contactId,
        pipelineId,
        stageId,
        {
          firstName,
          lastName,
          message,
          interests,
          inquiryFor,
          budgetAuthority,
          budgetRange,
          timeline,
          specificDate,
          company,
        }
      );

      const opportunityId = opportunity?.opportunity?.id;
      console.log("Opportunity created:", opportunityId ?? "unknown");

      if (company && opportunityId) {
        const companyId = await findCompanyByName(apiKey, locationId, company);
        if (companyId) {
          const assocResult = await associateOpportunityWithCompany(
            apiKey,
            locationId,
            GHL_ASSOCIATION_ID,
            opportunityId,
            companyId
          );
          console.log("Opportunity-Company association:", assocResult ? "created" : "failed");
        } else {
          console.log("Company not found in GHL for association:", company);
        }
      }
    } else {
      console.log("Skipping opportunity creation (skipOpportunity=true)");
    }

    return new Response(JSON.stringify({ success: true, contactId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
