// Admin-only liveness probes for third-party integration secrets.
// Each probe makes a single low-cost read call so we can confirm credentials work
// in the CURRENT project. Run from /admin/secrets-handoff to validate the
// migration end-to-end.

import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ProbeResult = {
  id: string;
  label: string;
  category: string;
  required_secret: string;
  status: "pass" | "fail" | "skipped";
  http_status?: number;
  latency_ms?: number;
  detail?: string;
  hint?: string;
};

async function timed<T>(fn: () => Promise<T>): Promise<{ value: T; ms: number }> {
  const t0 = performance.now();
  const value = await fn();
  return { value, ms: Math.round(performance.now() - t0) };
}

function skipped(id: string, label: string, category: string, secret: string, reason: string): ProbeResult {
  return { id, label, category, required_secret: secret, status: "skipped", detail: reason };
}

async function probeGhl(): Promise<ProbeResult> {
  const apiKey = Deno.env.get("GHL_API_KEY");
  const locationId = Deno.env.get("GHL_LOCATION_ID");
  if (!apiKey) return skipped("ghl", "GoHighLevel", "CRM", "GHL_API_KEY", "GHL_API_KEY not set");
  if (!locationId) return skipped("ghl", "GoHighLevel", "CRM", "GHL_LOCATION_ID", "GHL_LOCATION_ID not set");
  try {
    const { value: res, ms } = await timed(() =>
      fetch(`https://services.leadconnectorhq.com/locations/${locationId}`, {
        headers: { Authorization: `Bearer ${apiKey}`, Version: "2021-07-28", Accept: "application/json" },
      }),
    );
    const ok = res.ok;
    const body = await res.text();
    return {
      id: "ghl", label: "GoHighLevel", category: "CRM", required_secret: "GHL_API_KEY",
      status: ok ? "pass" : "fail", http_status: res.status, latency_ms: ms,
      detail: ok ? `Location ${locationId} reachable` : body.slice(0, 200),
      hint: ok ? undefined : "Verify GHL_API_KEY is a Private Integration token with Locations.read scope.",
    };
  } catch (e: any) {
    return { id: "ghl", label: "GoHighLevel", category: "CRM", required_secret: "GHL_API_KEY", status: "fail", detail: e?.message };
  }
}

async function probeStripe(): Promise<ProbeResult> {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) return skipped("stripe", "Stripe", "Payments", "STRIPE_SECRET_KEY", "STRIPE_SECRET_KEY not set");
  try {
    const { value: res, ms } = await timed(() =>
      fetch("https://api.stripe.com/v1/balance", { headers: { Authorization: `Bearer ${key}` } }),
    );
    const ok = res.ok;
    const body = await res.json().catch(() => ({}));
    const mode = key.startsWith("sk_live_") ? "live" : key.startsWith("sk_test_") ? "test" : "unknown";
    return {
      id: "stripe", label: "Stripe", category: "Payments", required_secret: "STRIPE_SECRET_KEY",
      status: ok ? "pass" : "fail", http_status: res.status, latency_ms: ms,
      detail: ok ? `Balance reachable · key mode: ${mode}` : (body?.error?.message ?? "unknown error"),
      hint: ok ? undefined : "Confirm STRIPE_SECRET_KEY belongs to the right Stripe account/mode.",
    };
  } catch (e: any) {
    return { id: "stripe", label: "Stripe", category: "Payments", required_secret: "STRIPE_SECRET_KEY", status: "fail", detail: e?.message };
  }
}

async function probeResend(): Promise<ProbeResult> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return skipped("resend", "Resend", "Email", "RESEND_API_KEY", "RESEND_API_KEY not set");
  try {
    const { value: res, ms } = await timed(() =>
      fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${key}` } }),
    );
    const ok = res.ok;
    const body = await res.json().catch(() => ({}));
    const count = Array.isArray((body as any)?.data) ? (body as any).data.length : undefined;
    return {
      id: "resend", label: "Resend", category: "Email", required_secret: "RESEND_API_KEY",
      status: ok ? "pass" : "fail", http_status: res.status, latency_ms: ms,
      detail: ok ? `Domains list returned${count !== undefined ? ` (${count} domain${count === 1 ? "" : "s"})` : ""}` : ((body as any)?.message ?? "unknown error"),
      hint: ok ? undefined : "Verify RESEND_API_KEY has read access.",
    };
  } catch (e: any) {
    return { id: "resend", label: "Resend", category: "Email", required_secret: "RESEND_API_KEY", status: "fail", detail: e?.message };
  }
}

async function probeYouTube(): Promise<ProbeResult> {
  const key = Deno.env.get("YOUTUBE_API_KEY");
  if (!key) return skipped("youtube", "YouTube Data API", "Media", "YOUTUBE_API_KEY", "YOUTUBE_API_KEY not set");
  try {
    const { value: res, ms } = await timed(() =>
      fetch(`https://www.googleapis.com/youtube/v3/videos?part=id&id=dQw4w9WgXcQ&key=${encodeURIComponent(key)}`),
    );
    const ok = res.ok;
    const body = await res.json().catch(() => ({}));
    return {
      id: "youtube", label: "YouTube Data API", category: "Media", required_secret: "YOUTUBE_API_KEY",
      status: ok ? "pass" : "fail", http_status: res.status, latency_ms: ms,
      detail: ok ? "videos.list responded" : ((body as any)?.error?.message ?? "unknown error"),
      hint: ok ? undefined : "Confirm key has YouTube Data API v3 enabled and isn't IP-restricted.",
    };
  } catch (e: any) {
    return { id: "youtube", label: "YouTube Data API", category: "Media", required_secret: "YOUTUBE_API_KEY", status: "fail", detail: e?.message };
  }
}

async function probeAnthropic(): Promise<ProbeResult> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return skipped("anthropic", "Anthropic", "AI", "ANTHROPIC_API_KEY", "ANTHROPIC_API_KEY not set");
  // /v1/models is a free GET with auth
  try {
    const { value: res, ms } = await timed(() =>
      fetch("https://api.anthropic.com/v1/models?limit=1", {
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
      }),
    );
    const ok = res.ok;
    const body = await res.json().catch(() => ({}));
    return {
      id: "anthropic", label: "Anthropic", category: "AI", required_secret: "ANTHROPIC_API_KEY",
      status: ok ? "pass" : "fail", http_status: res.status, latency_ms: ms,
      detail: ok ? "Models endpoint reachable" : ((body as any)?.error?.message ?? "unknown error"),
      hint: ok ? undefined : "Verify ANTHROPIC_API_KEY is active.",
    };
  } catch (e: any) {
    return { id: "anthropic", label: "Anthropic", category: "AI", required_secret: "ANTHROPIC_API_KEY", status: "fail", detail: e?.message };
  }
}

async function probeLovableAi(): Promise<ProbeResult> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return skipped("lovable_ai", "Lovable AI Gateway", "AI", "LOVABLE_API_KEY", "LOVABLE_API_KEY not set");
  try {
    const { value: res, ms } = await timed(() =>
      fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1,
        }),
      }),
    );
    const ok = res.ok || res.status === 402; // 402 still proves auth works
    const body = await res.text();
    return {
      id: "lovable_ai", label: "Lovable AI Gateway", category: "AI", required_secret: "LOVABLE_API_KEY",
      status: ok ? "pass" : "fail", http_status: res.status, latency_ms: ms,
      detail: ok ? (res.status === 402 ? "Auth OK · workspace out of credits (402)" : "Chat completions reachable") : body.slice(0, 200),
      hint: ok ? undefined : "Confirm LOVABLE_API_KEY belongs to this workspace.",
    };
  } catch (e: any) {
    return { id: "lovable_ai", label: "Lovable AI Gateway", category: "AI", required_secret: "LOVABLE_API_KEY", status: "fail", detail: e?.message };
  }
}

async function probeFirecrawl(): Promise<ProbeResult> {
  const key = Deno.env.get("FIRECRAWL_API_KEY");
  if (!key) return skipped("firecrawl", "Firecrawl", "Scraping", "FIRECRAWL_API_KEY", "FIRECRAWL_API_KEY not set");
  try {
    const { value: res, ms } = await timed(() =>
      fetch("https://api.firecrawl.dev/v1/team/credit-usage", {
        headers: { Authorization: `Bearer ${key}` },
      }),
    );
    const ok = res.ok;
    const body = await res.json().catch(() => ({}));
    return {
      id: "firecrawl", label: "Firecrawl", category: "Scraping", required_secret: "FIRECRAWL_API_KEY",
      status: ok ? "pass" : "fail", http_status: res.status, latency_ms: ms,
      detail: ok ? "Credit usage reachable" : ((body as any)?.error ?? "unknown error"),
      hint: ok ? undefined : "Confirm FIRECRAWL_API_KEY is valid (managed via Connectors).",
    };
  } catch (e: any) {
    return { id: "firecrawl", label: "Firecrawl", category: "Scraping", required_secret: "FIRECRAWL_API_KEY", status: "fail", detail: e?.message };
  }
}

async function probeSupabaseServiceRole(): Promise<ProbeResult> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return skipped("sb_service", "Supabase service role", "Backend", "SUPABASE_SERVICE_ROLE_KEY", "URL or key not set");
  try {
    const { value: res, ms } = await timed(() =>
      fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      }),
    );
    const ok = res.ok;
    const body = await res.text();
    return {
      id: "sb_service", label: "Supabase service role", category: "Backend", required_secret: "SUPABASE_SERVICE_ROLE_KEY",
      status: ok ? "pass" : "fail", http_status: res.status, latency_ms: ms,
      detail: ok ? "REST self-call succeeded with service-role key" : body.slice(0, 200),
      hint: ok ? undefined : "Service-role key does not match SUPABASE_URL.",
    };
  } catch (e: any) {
    return { id: "sb_service", label: "Supabase service role", category: "Backend", required_secret: "SUPABASE_SERVICE_ROLE_KEY", status: "fail", detail: e?.message };
  }
}

const ALL_PROBES: Record<string, () => Promise<ProbeResult>> = {
  ghl: probeGhl,
  stripe: probeStripe,
  resend: probeResend,
  youtube: probeYouTube,
  anthropic: probeAnthropic,
  lovable_ai: probeLovableAi,
  firecrawl: probeFirecrawl,
  sb_service: probeSupabaseServiceRole,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Admin gate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: u } = await supa.auth.getUser();
    if (!u?.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: prof } = await admin.from("profiles").select("role").eq("id", u.user.id).maybeSingle();
    if (prof?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let only: string[] | undefined;
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      if (Array.isArray(body?.only)) only = body.only;
    }

    const ids = only?.length ? only.filter((id) => id in ALL_PROBES) : Object.keys(ALL_PROBES);
    const results = await Promise.all(ids.map((id) => ALL_PROBES[id]()));
    const summary = {
      total: results.length,
      pass: results.filter((r) => r.status === "pass").length,
      fail: results.filter((r) => r.status === "fail").length,
      skipped: results.filter((r) => r.status === "skipped").length,
    };

    return new Response(
      JSON.stringify({ ok: true, checked_at: new Date().toISOString(), summary, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
