import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Verify the caller is a signed-in admin or editor. Returns null when authorized,
 *  or a Response (401/403) to short-circuit the handler when not. */
async function requireAdminOrEditor(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    return new Response(JSON.stringify({ error: "Service configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: profile } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "admin" && profile.role !== "editor")) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return null;
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

async function fetchPlaylists(apiKey: string, channelId: string) {
  const playlists: { id: string; title: string; itemCount: number }[] = [];
  let pageToken = "";

  do {
    const url = `https://www.googleapis.com/youtube/v3/playlists?channelId=${channelId}&part=snippet,contentDetails&maxResults=50&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) {
      const t = await res.text();
      console.error("Playlists API error:", res.status, t);
      break;
    }
    const data = await res.json();
    for (const item of data.items || []) {
      playlists.push({
        id: item.id,
        title: item.snippet.title,
        itemCount: item.contentDetails?.itemCount || 0,
      });
    }
    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return playlists.sort((a, b) => a.title.localeCompare(b.title));
}

async function getChannelIdFromVideo(apiKey: string, videoId: string): Promise<string | null> {
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data.items?.[0]?.snippet?.channelId || null;
}

function extractChannelHandle(url: string): string | null {
  const m = url.match(/youtube\.com\/@([a-zA-Z0-9_.-]+)/);
  return m ? m[1] : null;
}

async function getChannelIdFromHandle(apiKey: string, handle: string): Promise<string | null> {
  const url = `https://www.googleapis.com/youtube/v3/channels?forHandle=@${handle}&part=id&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data.items?.[0]?.id || null;
}

async function getRecentVideoIdsFromChannel(apiKey: string, channelId: string, max = 50): Promise<string[]> {
  // Uploads playlist ID = channelId with 2nd char replaced with 'U'
  const uploadsPlaylistId = "UU" + channelId.slice(2);
  const ids: string[] = [];
  let pageToken = "";
  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${uploadsPlaylistId}&part=contentDetails&maxResults=50&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) break;
    const data = await res.json();
    for (const item of data.items || []) {
      if (item.contentDetails?.videoId) ids.push(item.contentDetails.videoId);
      if (ids.length >= max) return ids;
    }
    pageToken = data.nextPageToken || "";
  } while (pageToken && ids.length < max);
  return ids;
}

/** Build a map of videoId -> first playlist title that contains it, scanning all channel playlists. */
async function buildVideoPlaylistMap(
  apiKey: string,
  playlists: { id: string; title: string }[],
): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const pl of playlists) {
    let pageToken = "";
    do {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${pl.id}&part=contentDetails&maxResults=50&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) break;
      const data = await res.json();
      for (const item of data.items || []) {
        const vid = item.contentDetails?.videoId;
        if (vid && !map[vid]) map[vid] = pl.title;
      }
      pageToken = data.nextPageToken || "";
    } while (pageToken);
  }
  return map;
}


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // YouTube API quota is shared; only admins/editors may consume it.
  const authError = await requireAdminOrEditor(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { action } = body;

    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "YOUTUBE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: fetch playlists
    if (action === "playlists") {
      const { channel_id, video_url } = body;
      let resolvedChannelId = channel_id;

      // If no channel_id, try to get it from a video URL
      if (!resolvedChannelId && video_url) {
        const vid = extractVideoId(video_url);
        if (vid) {
          resolvedChannelId = await getChannelIdFromVideo(apiKey, vid);
        }
      }

      if (!resolvedChannelId) {
        return new Response(JSON.stringify({ error: "Could not determine channel ID" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const playlists = await fetchPlaylists(apiKey, resolvedChannelId);
      return new Response(JSON.stringify({ channel_id: resolvedChannelId, playlists }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: list recent video URLs from a channel handle or URL
    if (action === "channel_videos") {
      const { channel_url, handle, max } = body;
      let resolvedHandle: string | null = handle || null;
      if (!resolvedHandle && channel_url) resolvedHandle = extractChannelHandle(channel_url);
      if (!resolvedHandle) {
        return new Response(JSON.stringify({ error: "Provide a channel URL like https://www.youtube.com/@handle" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const channelId = await getChannelIdFromHandle(apiKey, resolvedHandle);
      if (!channelId) {
        return new Response(JSON.stringify({ error: `Could not resolve channel @${resolvedHandle}` }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const ids = await getRecentVideoIdsFromChannel(apiKey, channelId, Math.min(Math.max(max || 25, 1), 100));
      const urls = ids.map((id) => `https://www.youtube.com/watch?v=${id}`);
      return new Response(JSON.stringify({ channel_id: channelId, handle: resolvedHandle, video_urls: urls }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default action: fetch video metadata
    const { url } = body;
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return new Response(JSON.stringify({ error: "Could not extract video ID from URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`;
    const apiRes = await fetch(apiUrl);

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("YouTube API error:", apiRes.status, errText);
      return new Response(JSON.stringify({ error: "YouTube API error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiData = await apiRes.json();
    if (!apiData.items || apiData.items.length === 0) {
      return new Response(JSON.stringify({ error: "Video not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const item = apiData.items[0];
    const snippet = item.snippet;
    const contentDetails = item.contentDetails;

    // Also fetch channel playlists alongside metadata
    const channelId = snippet.channelId;
    let playlists: { id: string; title: string; itemCount: number }[] = [];
    if (channelId) {
      try {
        playlists = await fetchPlaylists(apiKey, channelId);
      } catch (e) {
        console.error("Failed to fetch playlists alongside metadata:", e);
      }
    }

    const result = {
      youtube_video_id: videoId,
      title: snippet.title,
      description: snippet.description?.substring(0, 500) || "",
      thumbnail_url: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || "",
      duration: parseDuration(contentDetails.duration || ""),
      published_date: snippet.publishedAt ? snippet.publishedAt.split("T")[0] : null,
      channel_title: snippet.channelTitle || "",
      channel_id: channelId || null,
      playlists,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-youtube-metadata error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
