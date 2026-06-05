import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://onthepaintedporch.com";
const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

interface GhlContact {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
}

async function searchContactsByTag(apiKey: string, locationId: string, tag: string): Promise<GhlContact[]> {
  const all: GhlContact[] = [];
  let page = 1;
  // Hard cap to avoid runaway calls
  while (page <= 20) {
    const body = {
      locationId,
      pageLimit: 100,
      page,
      filters: [{ field: "tags", operator: "contains", value: tag }],
    };
    const res = await fetch(`${GHL_API}/contacts/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Version: GHL_VERSION,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GHL search failed (${res.status}): ${text.slice(0, 300)}`);
    }
    const data = await res.json();
    const contacts: GhlContact[] = data.contacts || [];
    all.push(...contacts);
    if (contacts.length < 100) break;
    page += 1;
  }
  return all;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const GHL_API_KEY = Deno.env.get("GHL_API_KEY");
    const GHL_LOCATION_ID = Deno.env.get("GHL_LOCATION_ID");
    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
      return new Response(JSON.stringify({ error: "GHL credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is admin
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await userClient.auth.getUser();
    const userId = userRes?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: isAdminRes, error: adminErr } = await admin.rpc("is_admin", { _user_id: userId });
    if (adminErr || !isAdminRes) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { slug, force } = await req.json().catch(() => ({}));
    if (!slug || typeof slug !== "string") {
      return new Response(JSON.stringify({ error: "Missing slug" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: course, error: courseErr } = await admin
      .from("course_launch_status")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (courseErr || !course) {
      return new Response(JSON.stringify({ error: "Course not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (course.notified_at && !force) {
      return new Response(
        JSON.stringify({
          error: "Already notified",
          notified_at: course.notified_at,
          notified_count: course.notified_count,
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const tag = `course-launch-${slug}`;
    const courseUrl = course.checkout_url || `${SITE_URL}${course.course_path}`;

    let contacts: GhlContact[];
    try {
      contacts = await searchContactsByTag(GHL_API_KEY, GHL_LOCATION_ID, tag);
    } catch (err: any) {
      await admin
        .from("course_launch_status")
        .update({ last_notify_error: String(err?.message || err).slice(0, 500) })
        .eq("slug", slug);
      throw err;
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const c of contacts) {
      const email = (c.email || "").trim();
      if (!email) continue;
      try {
        const { error } = await admin.functions.invoke("send-transactional-email", {
          body: {
            templateName: "course-launch-available",
            recipientEmail: email,
            idempotencyKey: `course-launch-available-${slug}-${c.id}`,
            templateData: {
              firstName: c.firstName || "",
              courseName: course.course_name,
              courseUrl,
            },
          },
        });
        if (error) throw error;
        sent += 1;
      } catch (err: any) {
        failed += 1;
        errors.push(`${email}: ${err?.message || err}`);
      }
    }

    await admin
      .from("course_launch_status")
      .update({
        notified_at: new Date().toISOString(),
        notified_count: sent,
        last_notify_error: failed > 0 ? errors.slice(0, 5).join(" | ").slice(0, 500) : null,
      })
      .eq("slug", slug);

    return new Response(
      JSON.stringify({ ok: true, total: contacts.length, sent, failed, errors: errors.slice(0, 10) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("notify-course-launch error", err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
