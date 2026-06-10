import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Explicit allowlist of GHL endpoints we proxy. Anything else is rejected
// to prevent attackers from pivoting to arbitrary GHL sub-endpoints.
const ENDPOINT_ALLOWLIST = new Set(["custom-fields", "contacts"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // === AuthN + AuthZ: require admin/editor JWT ===
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (!profile || !["admin", "editor"].includes(profile.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GHL_API_KEY");
    if (!apiKey) {
      throw new Error("GHL_API_KEY not configured");
    }

    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint") || "custom-fields";
    const apiVersion = url.searchParams.get("version") || "2021-07-28";

    if (!ENDPOINT_ALLOWLIST.has(endpoint)) {
      return new Response(
        JSON.stringify({ error: "Endpoint not permitted" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let ghlUrl: string;
    switch (endpoint) {
      case "custom-fields":
        ghlUrl = "https://services.leadconnectorhq.com/locations/custom-fields";
        break;
      case "contacts":
        ghlUrl = "https://services.leadconnectorhq.com/contacts";
        break;
      default:
        ghlUrl = `https://services.leadconnectorhq.com/${endpoint}`;
    }

    const params = new URLSearchParams();
    for (const [key, val] of url.searchParams.entries()) {
      if (key !== "endpoint" && key !== "version") params.set(key, val);
    }
    const queryString = params.toString();
    const fullUrl = queryString ? `${ghlUrl}?${queryString}` : ghlUrl;

    const res = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Version: apiVersion,
      },
    });

    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GHL query error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
