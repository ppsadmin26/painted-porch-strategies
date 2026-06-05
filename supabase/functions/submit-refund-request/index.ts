import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPPORT_EMAIL = "support@onthepaintedporch.com";

interface RefundRequestBody {
  name?: string;
  email?: string;
  program?: string;
  purchaseDate?: string; // YYYY-MM-DD
  reason?: string;
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isDate(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body: RefundRequestBody = await req.json();

    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();
    const program = (body.program ?? "").trim();
    const purchaseDate = (body.purchaseDate ?? "").trim();
    const reason = (body.reason ?? "").trim() || null;

    if (!name || name.length > 200) {
      return new Response(JSON.stringify({ error: "Valid name is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!email || !isEmail(email) || email.length > 255) {
      return new Response(JSON.stringify({ error: "A valid email address is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!program || program.length > 200) {
      return new Response(JSON.stringify({ error: "Program is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!purchaseDate || !isDate(purchaseDate)) {
      return new Response(JSON.stringify({ error: "A valid purchase date is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (reason && reason.length > 5000) {
      return new Response(JSON.stringify({ error: "Reason is too long." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: inserted, error: insertError } = await supabase
      .from("refund_requests")
      .insert({
        name,
        email,
        program,
        purchase_date: purchaseDate,
        reason,
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      console.error("Insert refund_requests failed:", insertError);
      return new Response(
        JSON.stringify({ error: "We couldn't save your request. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const requestId: string = inserted.id;
    const createdAt: string = inserted.created_at;

    // 1) Confirmation to customer (fire and forget — we don't block on email)
    supabase.functions
      .invoke("send-transactional-email", {
        body: {
          templateName: "refund-request-confirmation",
          recipientEmail: email,
          idempotencyKey: `refund-conf-${requestId}`,
          templateData: {
            firstName: name.split(" ")[0],
            program,
            purchaseDate,
            requestId,
          },
        },
      })
      .catch((err) => console.error("Refund confirmation email error:", err));

    // 2) Notification to support
    supabase.functions
      .invoke("send-transactional-email", {
        body: {
          templateName: "refund-request-notification",
          recipientEmail: SUPPORT_EMAIL,
          idempotencyKey: `refund-notif-${requestId}`,
          templateData: {
            name,
            email,
            program,
            purchaseDate,
            reason: reason ?? "",
            requestId,
            submittedAt: createdAt,
          },
        },
      })
      .catch((err) => console.error("Refund support notification email error:", err));

    return new Response(
      JSON.stringify({ ok: true, requestId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("submit-refund-request error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
