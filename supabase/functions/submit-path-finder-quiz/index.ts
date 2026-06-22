// P.A.T.H. Finder quiz: emails user their results; if subscribe=true, also syncs to GHL with PathQuiz tag.
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

interface RecItem { name: string; url: string; blurb: string; tier: string }
interface RecGroup { heading: string; items: RecItem[] }
interface ContentItem { kind: "blog" | "media"; title: string; url: string; excerpt?: string; thumbnail?: string; date?: string; source?: string }
interface Body {
  firstName: string;
  email: string;
  subscribe: boolean;
  track: "b2c" | "b2b";
  resultType: string;
  headline: string;
  subhead?: string;
  answers: Record<string, string | string[]>;
  recommendations: RecGroup[];
  strongestNextStep?: { name: string; url: string; label: string } | null;
  relatedContent?: ContentItem[];
}

function buildNote(b: Body): string {
  const date = new Date().toLocaleDateString("en-US", { timeZone: "America/Phoenix" });
  const lines = [
    `P.A.T.H. Finder — ${date}`,
    ``,
    `Track: ${b.track.toUpperCase()}  |  Result: ${b.resultType} — ${b.headline}`,
    b.strongestNextStep ? `Strongest Next Step: ${b.strongestNextStep.name}` : null,
    ``,
    `ANSWERS`,
    ...Object.entries(b.answers).map(([k, v]) => `• ${k}: ${Array.isArray(v) ? v.join(", ") : v}`),
    ``,
    `RECOMMENDATIONS`,
    ...b.recommendations.flatMap((g) => [`> ${g.heading}`, ...g.items.map((i) => `  - ${i.name} (${i.tier})`)]),
  ].filter(Boolean);
  return lines.join("\n");
}

async function upsertContact(apiKey: string, locationId: string, b: Body): Promise<string> {
  const tags = ["PathQuiz", `path-finder-${b.resultType}`, `path-finder-${b.track}`];
  const search = await fetch(
    `${GHL_BASE}/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(b.email)}`,
    { headers: ghlHeaders(apiKey) },
  );
  let existing: { id?: string; tags?: string[] } | null = null;
  if (search.ok) {
    const data = await search.json();
    if (data?.contact?.id) existing = data.contact;
  }
  if (existing?.id) {
    const merged = Array.from(new Set([...(existing.tags ?? []), ...tags]));
    const res = await fetch(`${GHL_BASE}/contacts/${existing.id}`, {
      method: "PUT", headers: ghlHeaders(apiKey),
      body: JSON.stringify({ firstName: b.firstName.trim(), tags: merged }),
    });
    if (!res.ok) console.error("GHL update fail", res.status, await res.text());
    return existing.id;
  }
  const res = await fetch(`${GHL_BASE}/contacts/`, {
    method: "POST", headers: ghlHeaders(apiKey),
    body: JSON.stringify({
      locationId, firstName: b.firstName.trim(), email: b.email.trim(),
      tags, source: "P.A.T.H. Finder Quiz",
    }),
  });
  if (!res.ok) throw new Error(`GHL create fail: ${res.status} ${await res.text()}`);
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    if (!body.firstName || !body.email || !body.resultType) {
      return new Response(JSON.stringify({ error: "firstName, email, resultType required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GHL sync ONLY if user opted in to subscribe
    let contactId: string | null = null;
    if (body.subscribe) {
      const apiKey = Deno.env.get("GHL_API_KEY");
      const locationId = Deno.env.get("GHL_LOCATION_ID");
      if (apiKey && locationId) {
        try {
          contactId = await upsertContact(apiKey, locationId, body);
          await addNote(apiKey, contactId, buildNote(body));
        } catch (e) {
          console.error("GHL sync failed (continuing):", e);
        }
      }
    }

    // Always email results to user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { error: emailErr } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "path-finder-results",
        recipientEmail: body.email,
        idempotencyKey: `path-finder-${body.email}-${Date.now()}`,
        templateData: {
          firstName: body.firstName,
          headline: body.headline,
          subhead: body.subhead ?? "",
          resultType: body.resultType,
          track: body.track,
          strongestNextStep: body.strongestNextStep,
          recommendations: body.recommendations,
        },
      },
    });
    if (emailErr) console.error("Results email queue failed:", emailErr);

    return new Response(JSON.stringify({ ok: true, contactId, subscribed: body.subscribe }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("submit-path-finder-quiz error:", msg);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
