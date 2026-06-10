import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Body {
  slug?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  newsletter?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { slug, firstName, lastName, email, newsletter } = (await req
      .json()
      .catch(() => ({}))) as Body;

    if (!slug || !email || !firstName) {
      return new Response(JSON.stringify({ error: "Missing slug, email, or firstName" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ADMIN_FALLBACK = "explore@onthepaintedporch.com";
    const ADMIN_RAW = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "";
    // Guard against unset / placeholder values from infra setup
    const ADMIN_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_RAW) ? ADMIN_RAW : ADMIN_FALLBACK;

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: program, error: progErr } = await admin
      .from("course_launch_status")
      .select("slug, course_name, program_type, signup_confirmation_enabled, admin_alert_enabled")
      .eq("slug", slug)
      .maybeSingle();

    if (progErr || !program) {
      return new Response(JSON.stringify({ error: "Program not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const id = crypto.randomUUID();
    const results: Record<string, unknown> = {
      confirmation_sent: false,
      admin_alert_sent: false,
    };

    // Signup confirmation to the person
    if (program.signup_confirmation_enabled) {
      try {
        const { error } = await admin.functions.invoke("send-transactional-email", {
          body: {
            templateName: "course-launch-list",
            recipientEmail: email.trim(),
            idempotencyKey: `launch-signup-confirm-${slug}-${id}`,
            templateData: {
              firstName: firstName.trim(),
              courseName: program.course_name,
            },
          },
        });
        if (error) throw error;
        results.confirmation_sent = true;
      } catch (err: any) {
        results.confirmation_error = err?.message || String(err);
      }
    }

    // Admin alert
    if (program.admin_alert_enabled) {
      try {
        const { error } = await admin.functions.invoke("send-transactional-email", {
          body: {
            templateName: "launch-list-signup-admin",
            recipientEmail: ADMIN_EMAIL,
            idempotencyKey: `launch-signup-admin-${slug}-${id}`,
            templateData: {
              programName: program.course_name,
              programType: program.program_type,
              programSlug: program.slug,
              firstName: firstName.trim(),
              lastName: (lastName || "").trim(),
              email: email.trim(),
              newsletter: !!newsletter,
            },
          },
        });
        if (error) throw error;
        results.admin_alert_sent = true;
      } catch (err: any) {
        results.admin_alert_error = err?.message || String(err);
      }
    }

    return new Response(JSON.stringify({ ok: true, ...results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("notify-launch-signup error", err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
