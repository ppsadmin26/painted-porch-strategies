import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED = new Set(["new", "in_review", "approved", "rejected"]);

interface Body {
  id?: string;
  status?: string;
  adminNotes?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin/editor via their JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: profile } = await admin
      .from("profiles").select("role").eq("id", userRes.user.id).single();
    if (!profile || !["admin", "editor"].includes((profile as any).role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: Body = await req.json();
    const id = (body.id ?? "").trim();
    const status = (body.status ?? "").trim();
    const adminNotes = body.adminNotes == null ? null : String(body.adminNotes).slice(0, 5000);

    if (!id) return new Response(JSON.stringify({ error: "id required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    if (!ALLOWED.has(status)) return new Response(JSON.stringify({ error: "Invalid status" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    const { data: existing, error: fetchErr } = await admin
      .from("refund_requests").select("*").eq("id", id).single();
    if (fetchErr || !existing) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isFinal = status === "approved" || status === "rejected";
    const update: Record<string, any> = {
      status,
      admin_notes: adminNotes,
    };
    if (isFinal && !existing.processed_at) update.processed_at = new Date().toISOString();

    const { data: updated, error: updErr } = await admin
      .from("refund_requests").update(update).eq("id", id).select().single();
    if (updErr) {
      console.error("Update refund_requests failed:", updErr);
      return new Response(JSON.stringify({ error: "Update failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Notify customer if status changed to approved/rejected
    const statusChanged = existing.status !== status;
    if (isFinal && statusChanged) {
      admin.functions.invoke("send-transactional-email", {
        body: {
          templateName: "refund-request-processed",
          recipientEmail: updated.email,
          idempotencyKey: `refund-processed-${id}-${status}`,
          templateData: {
            firstName: String(updated.name || "").split(" ")[0],
            program: updated.program,
            status,
            adminNotes: adminNotes ?? "",
            requestId: id,
          },
        },
      }).catch((e) => console.error("Refund processed email error:", e));
    }

    return new Response(JSON.stringify({ ok: true, request: updated, emailed: isFinal && statusChanged }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("update-refund-status error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
