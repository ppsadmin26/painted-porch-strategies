import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GHL_API_KEY");
    if (!apiKey) {
      throw new Error("GHL_API_KEY not configured");
    }

    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint") || "custom-fields";
    const apiVersion = url.searchParams.get("version") || "2021-07-28";

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

    // Forward query params (except endpoint and version)
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

    console.log("GHL request:", fullUrl, "status:", res.status);
    const data = await res.text();
    console.log("GHL response:", data.substring(0, 500));

    return new Response(data, {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GHL query error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
