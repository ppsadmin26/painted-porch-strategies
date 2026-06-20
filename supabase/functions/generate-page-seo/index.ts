import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRAND_CONTEXT = `Painted Porch Strategies (PPS) is an organizational change consultancy.
Voice: conversational yet authoritative, "huggable bear" — supportive and challenging.
Frameworks: Phase Zero™ (strategic authorship before implementation), P.A.T.H.™ (Prepare, Align, Take Off, Habit), The Painted Porch Pillars™ (Cultural Cornerstone, Operational Frame, Living Ecosystem).
Tiers: IGNITE (self-led), AMPLIFY (3-6mo partnership), EMBODY (6-12mo+ embedded). Blue Door = $1,500 strategic appraisal, prerequisite for engagements.
Tone: 6th-grade reading level, NEVER use em-dashes (—). Avoid servant language (help, assist); use partnership language (partner, co-design, activate, architect).`;

async function generateSeo(path: string, context: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("AI not configured");

  const prompt = `You are an SEO/AEO specialist for Painted Porch Strategies.

${BRAND_CONTEXT}

PAGE PATH: ${path}
${context ? `PAGE CONTEXT / SUMMARY:\n${context.slice(0, 4000)}` : "(No extra context provided — infer from the path and brand context above.)"}

Generate optimized SEO + AEO (Answer Engine Optimization) metadata. Return RAW JSON only (no markdown fences):

{
  "title": "Page title under 60 chars, includes primary keyword",
  "description": "Compelling meta description under 160 chars",
  "keywords": ["array", "of", "8-12", "relevant", "keywords"],
  "og_title": "Social-friendly title (can match title)",
  "og_description": "Social-friendly description (can match description)",
  "aeo_summary": "A plain-language 2-3 sentence answer that an AI engine (ChatGPT, Perplexity, Google AI Overviews) could quote directly. Lead with the answer. Under 320 chars.",
  "aeo_faqs": [
    { "question": "Natural-language question a user would ask an AI", "answer": "Direct, quotable answer in 2-4 sentences" }
  ]
}

RULES:
- Title under 60 characters (hard cap 70)
- Description under 160 characters (hard cap 200)
- 3-5 AEO FAQ pairs, phrased the way real people ask AI engines
- NEVER use em-dashes (—) — use a comma, period, or colon
- Use partnership/momentum language, not servant language
- Include brand terms when relevant (Painted Porch Strategies, Phase Zero, P.A.T.H., Blue Door, IGNITE/AMPLIFY/EMBODY)
- Professional B2B executive/leadership audience`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("AI Gateway error:", res.status, text);
    if (res.status === 429) throw new Error("Rate limited, please try again in a moment");
    if (res.status === 402) throw new Error("AI credits exhausted — add credits in workspace settings");
    throw new Error("AI generation failed");
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";
  const cleaned = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse AI response:", raw);
    throw new Error("Failed to parse AI response");
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || !["admin", "editor"].includes(profile.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const path = String(body.path || "").trim();
    const context = String(body.context || "").trim();
    if (!path) {
      return new Response(JSON.stringify({ error: "path is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await generateSeo(path, context);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-page-seo error:", err);
    return new Response(JSON.stringify({ error: String((err as Error).message || err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
