// Migrate a video from any public URL into the site-videos bucket and update
// the site_videos registry row for a given slot. This is the canonical way to
// take a freshly generated Lovable video (or any external URL) and store it in
// our own bucket — never touching the repo / GitHub.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function inferExt(url: string, contentType: string | null): string {
  const ct = (contentType || "").toLowerCase();
  if (ct.includes("webm")) return "webm";
  if (ct.includes("quicktime")) return "mov";
  if (ct.includes("mp4")) return "mp4";
  const m = url.toLowerCase().match(/\.(mp4|webm|mov|m4v)(\?|$)/);
  if (m) return m[1] === "m4v" ? "mp4" : m[1];
  return "mp4";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is a logged-in admin
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userRes.user.id)
      .maybeSingle();
    if (!profile || (profile.role !== "admin" && profile.role !== "editor")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const slotKey: string = body?.slot_key;
    let sourceUrl: string = body?.source_url;
    if (!slotKey || !sourceUrl) {
      return new Response(
        JSON.stringify({ error: "slot_key and source_url required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Resolve relative URLs (e.g. "/__l5e/assets-v1/...") against the caller's origin
    if (sourceUrl.startsWith("/")) {
      const origin =
        req.headers.get("origin") ||
        (req.headers.get("referer")
          ? new URL(req.headers.get("referer")!).origin
          : null);
      if (!origin) {
        return new Response(
          JSON.stringify({
            error:
              "source_url is a relative path and no Origin/Referer header was provided",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      sourceUrl = origin + sourceUrl;
    }

    // Fetch the video from anywhere (Lovable CDN, external generator, etc.)
    const fetched = await fetch(sourceUrl);
    if (!fetched.ok || !fetched.body) {
      return new Response(
        JSON.stringify({
          error: `Source fetch failed: HTTP ${fetched.status}`,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    const contentType = fetched.headers.get("content-type") || "video/mp4";
    const ext = inferExt(sourceUrl, contentType);
    const blob = await fetched.blob();
    const sizeBytes = blob.size;

    const stamp = Date.now();
    const path = `${slotKey}/${stamp}.${ext}`;

    const { error: upErr } = await admin.storage
      .from("site-videos")
      .upload(path, blob, {
        cacheControl: "3600",
        upsert: false,
        contentType,
      });
    if (upErr) {
      return new Response(
        JSON.stringify({ error: `Upload failed: ${upErr.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const publicUrl = admin.storage.from("site-videos").getPublicUrl(path).data
      .publicUrl;

    // Upsert the registry row (preserve existing poster on replace)
    const { data: existing } = await admin
      .from("site_videos")
      .select("storage_path, poster_path")
      .eq("slot_key", slotKey)
      .maybeSingle();

    const row = {
      slot_key: slotKey,
      video_url: publicUrl,
      storage_path: path,
      updated_by: userRes.user.id,
    };

    if (existing) {
      await admin
        .from("site_videos")
        .update(row)
        .eq("slot_key", slotKey);
      // Best-effort cleanup of the old video file (keep poster — caller may
      // re-upload via the regular flow if they want a new poster)
      if (existing.storage_path) {
        await admin.storage
          .from("site-videos")
          .remove([existing.storage_path]);
      }
    } else {
      await admin.from("site_videos").insert(row);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        video_url: publicUrl,
        storage_path: path,
        size_bytes: sizeBytes,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
