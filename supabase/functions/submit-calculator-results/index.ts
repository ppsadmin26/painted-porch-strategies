// Cost-of-Skipping calculator: lead → GHL (upsert + tag + note + workflow) + transactional email.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

const ghlHeaders = (apiKey: string) => ({
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
  Version: GHL_VERSION,
});

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Math.round(n));

interface CalcResults {
  industry: string;
  industryKey: string;
  size: string;
  sizeKey: string;
  teamSize: number;
  durationMonths: number;
  avgLoadedSalary: number;
  outsideConsultants: boolean;
  plannedTotal: number;
  overrunLow: number;
  overrunHigh: number;
  failureWriteOff: number;
  exposureLow: number;
  exposureHigh: number;
}

interface Body {
  firstName: string;
  lastName?: string;
  email: string;
  company?: string;
  role?: string;
  results: CalcResults;
}

function buildNoteText(b: Body): string {
  const r = b.results;
  const lines = [
    `Cost-of-Skipping Calculator — ${new Date().toLocaleDateString("en-US", { timeZone: "America/Phoenix" })}`,
    ``,
    `Industry: ${r.industry}`,
    `Initiative size: ${r.size} (${r.teamSize} ppl)`,
    `Duration: ${r.durationMonths} months`,
    `Avg loaded salary: ${fmt(r.avgLoadedSalary)}`,
    `Outside consultants: ${r.outsideConsultants ? "Yes" : "No"}`,
    ``,
    `RESULTS`,
    `• Planned investment: ${fmt(r.plannedTotal)}`,
    `• Likely overrun: ${fmt(r.overrunLow)} – ${fmt(r.overrunHigh)}`,
    `• Failure write-off: ${fmt(r.failureWriteOff)}`,
    `• Blue Door de-risks: est. ${fmt(r.exposureLow)} – ${fmt(r.exposureHigh)}`,
    ``,
    b.company ? `Company: ${b.company}` : null,
    b.role ? `Role: ${b.role}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

async function upsertContact(apiKey: string, locationId: string, b: Body) {
  const tags = ["calc-cost-of-skipping"];

  const search = await fetch(
    `${GHL_BASE}/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(b.email)}`,
    { method: "GET", headers: ghlHeaders(apiKey) },
  );
  let existing: { id?: string; tags?: string[] } | null = null;
  if (search.ok) {
    const data = await search.json();
    if (data?.contact?.id) existing = data.contact;
  }

  if (existing?.id) {
    const mergedTags = Array.from(new Set([...(existing.tags ?? []), ...tags]));
    const updateBody: Record<string, unknown> = {
      firstName: b.firstName.trim(),
      tags: mergedTags,
    };
    if (b.lastName) updateBody.lastName = b.lastName.trim();
    if (b.company) updateBody.companyName = b.company.trim();
    const res = await fetch(`${GHL_BASE}/contacts/${existing.id}`, {
      method: "PUT", headers: ghlHeaders(apiKey),
      body: JSON.stringify(updateBody),
    });
    if (!res.ok) console.error("GHL update fail", res.status, await res.text());
    return existing.id;
  }

  const createBody: Record<string, unknown> = {
    locationId,
    firstName: b.firstName.trim(),
    email: b.email.trim(),
    tags,
    source: "Website Calculator",
  };
  if (b.lastName) createBody.lastName = b.lastName.trim();
  if (b.company) createBody.companyName = b.company.trim();

  const res = await fetch(`${GHL_BASE}/contacts/`, {
    method: "POST", headers: ghlHeaders(apiKey),
    body: JSON.stringify(createBody),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`GHL create failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data?.contact?.id as string;
}

async function addNote(apiKey: string, contactId: string, text: string) {
  const res = await fetch(`${GHL_BASE}/contacts/${contactId}/notes`, {
    method: "POST", headers: ghlHeaders(apiKey),
    body: JSON.stringify({ body: text }),
  });
  if (!res.ok) console.error("GHL note fail", res.status, await res.text());
}

async function subscribeToWorkflow(apiKey: string, contactId: string, workflowId: string) {
  const res = await fetch(
    `${GHL_BASE}/contacts/${contactId}/workflow/${workflowId}`,
    { method: "POST", headers: ghlHeaders(apiKey) },
  );
  if (!res.ok) console.error("GHL workflow subscribe fail", res.status, await res.text());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    if (!body.firstName || !body.email || !body.results) {
      return new Response(JSON.stringify({ error: "firstName, email, results required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GHL_API_KEY");
    const locationId = Deno.env.get("GHL_LOCATION_ID");
    if (!apiKey || !locationId) throw new Error("GHL credentials not configured");

    const contactId = await upsertContact(apiKey, locationId, body);
    console.log("Contact upserted:", contactId);

    await addNote(apiKey, contactId, buildNoteText(body));

    const workflowId = Deno.env.get("GHL_COST_CALC_WORKFLOW_ID");
    if (workflowId) {
      await subscribeToWorkflow(apiKey, contactId, workflowId);
    } else {
      console.log("GHL_COST_CALC_WORKFLOW_ID not set; skipping workflow subscribe");
    }

    // Queue branded results email via existing transactional system
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const r = body.results;
    const { error: emailErr } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "cost-calculator-results",
        recipientEmail: body.email,
        idempotencyKey: `calc-results-${contactId}-${Date.now()}`,
        templateData: {
          firstName: body.firstName,
          industry: r.industry,
          size: r.size,
          durationMonths: r.durationMonths,
          plannedTotal: r.plannedTotal,
          overrunLow: r.overrunLow,
          overrunHigh: r.overrunHigh,
          failureWriteOff: r.failureWriteOff,
          exposureLow: r.exposureLow,
          exposureHigh: r.exposureHigh,
        },
      },
    });
    if (emailErr) console.error("Results email queue failed:", emailErr);

    return new Response(JSON.stringify({ ok: true, contactId }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("submit-calculator-results error:", msg);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
