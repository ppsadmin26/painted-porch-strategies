import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2";

// Stripe webhooks must NOT have CORS or JWT verification — Stripe sends
// signed requests directly from its servers.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

const GHL_FIELD_IDS = {
  contact_source: "A28bKAM3DFGCczH7ck28",      // SINGLE_OPTIONS — "Offer Purchase"
  first_contact_date: "410RQnsoOeKEcmKVJw7i",
  offers_purchased: "qZ1RTXLJcunForUtEwZj",    // MULTIPLE_OPTIONS — append "Blue Door"
};

const GHL_PIPELINE = {
  id: "JfC0m9bkYA5Bx8V9Unwg",                  // Blue Door Appraisal
  purchasedStageId: "16633671-8016-4282-913b-e9016db970d1",
};

const BLUE_DOOR_INTERNAL_PRODUCT_ID = "69f556beda069a158c714f24";

function ghlHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Version: GHL_VERSION,
  };
}

function todayForGHL(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Phoenix" });
}

function formatAmount(amountTotal: number | null, currency: string | null): string {
  if (amountTotal == null) return "";
  const cur = (currency || "usd").toUpperCase();
  const value = amountTotal / 100;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(value);
  } catch {
    return `${value.toFixed(2)} ${cur}`;
  }
}

async function fetchExistingContact(apiKey: string, locationId: string, email: string) {
  const r = await fetch(
    `${GHL_BASE}/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(email)}`,
    { method: "GET", headers: ghlHeaders(apiKey) }
  );
  if (!r.ok) return null;
  const data = await r.json();
  return data?.contact || null;
}

async function upsertGhlContact(params: {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  amountFormatted: string;
  orderId: string;
}): Promise<string | null> {
  const apiKey = Deno.env.get("GHL_API_KEY");
  const locationId = Deno.env.get("GHL_LOCATION_ID");
  if (!apiKey || !locationId) {
    console.warn("GHL credentials missing — skipping contact upsert");
    return null;
  }

  const { email, firstName, lastName, company } = params;
  const tags = ["blue_door_purchaser"];

  const existing = await fetchExistingContact(apiKey, locationId, email);

  // Merge existing offers_purchased values (MULTIPLE_OPTIONS) so we don't overwrite
  let offersPurchasedValues: string[] = ["Blue Door"];
  if (existing?.customFields && Array.isArray(existing.customFields)) {
    const existingOffers = existing.customFields.find(
      (f: any) => f.id === GHL_FIELD_IDS.offers_purchased
    );
    if (existingOffers?.value) {
      const current = Array.isArray(existingOffers.value)
        ? existingOffers.value
        : String(existingOffers.value).split(",").map((s) => s.trim()).filter(Boolean);
      offersPurchasedValues = Array.from(new Set([...current, "Blue Door"]));
    }
  }

  const customFields = [
    { id: GHL_FIELD_IDS.contact_source, field_value: "Offer Purchase" },
    { id: GHL_FIELD_IDS.first_contact_date, field_value: todayForGHL() },
    { id: GHL_FIELD_IDS.offers_purchased, field_value: offersPurchasedValues },
  ];

  let contactId: string | null = existing?.id || null;

  if (contactId) {
    const updateBody: Record<string, unknown> = {
      firstName,
      lastName,
      tags,
      type: "client",
      companyName: company || undefined,
      dnd: false,
      dndSettings: { Email: { status: "active" } },
      customFields,
    };
    const r = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
      method: "PUT",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify(updateBody),
    });
    if (!r.ok) {
      console.error("GHL update failed:", r.status, await r.text());
    } else {
      console.log("GHL contact updated:", contactId);
    }
  } else {
    const createBody: Record<string, unknown> = {
      locationId,
      email,
      firstName,
      lastName,
      tags,
      type: "client",
      companyName: company || undefined,
      source: "Offer Purchase",
      customFields,
    };
    const r = await fetch(`${GHL_BASE}/contacts/`, {
      method: "POST",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify(createBody),
    });
    if (!r.ok) {
      console.error("GHL create failed:", r.status, await r.text());
    } else {
      const data = await r.json();
      contactId = data?.contact?.id || null;
      console.log("GHL contact created:", contactId);
    }
  }

  return contactId;
}

async function setContactStatusActive(contactId: string) {
  const apiKey = Deno.env.get("GHL_API_KEY")!;
  // Built-in contact status — set via PUT on contact (status field, not "type")
  const r = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
    method: "PUT",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({ status: "active" }),
  });
  if (!r.ok) {
    console.warn("GHL status update failed:", r.status, await r.text());
  }
}

async function appendNote(contactId: string, body: string) {
  const apiKey = Deno.env.get("GHL_API_KEY")!;
  const locationId = Deno.env.get("GHL_LOCATION_ID")!;
  try {
    await fetch(`${GHL_BASE}/contacts/${contactId}/notes`, {
      method: "POST",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify({ userId: locationId, body }),
    });
  } catch (err) {
    console.warn("GHL note append failed:", err);
  }
}

async function createOpportunity(params: {
  contactId: string;
  name: string;
  monetaryValue: number;
}) {
  const apiKey = Deno.env.get("GHL_API_KEY")!;
  const locationId = Deno.env.get("GHL_LOCATION_ID")!;
  const body = {
    pipelineId: GHL_PIPELINE.id,
    locationId,
    name: params.name,
    pipelineStageId: GHL_PIPELINE.purchasedStageId,
    status: "open",
    contactId: params.contactId,
    monetaryValue: params.monetaryValue,
  };
  const r = await fetch(`${GHL_BASE}/opportunities/`, {
    method: "POST",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    console.error("GHL opportunity create failed:", r.status, await r.text());
  } else {
    console.log("GHL opportunity created for contact:", params.contactId);
  }
}

async function sendConfirmationEmail(params: {
  email: string;
  firstName: string;
  company: string;
  amountFormatted: string;
  orderId: string;
}) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data, error } = await supabase.functions.invoke("send-transactional-email", {
    body: {
      templateName: "blue-door-purchase-confirmation",
      recipientEmail: params.email,
      idempotencyKey: `blue-door-${params.orderId}`,
      templateData: {
        firstName: params.firstName,
        company: params.company,
        amountFormatted: params.amountFormatted,
        orderId: params.orderId,
      },
    },
  });
  if (error) {
    console.error("send-transactional-email failed:", error);
  } else {
    console.log("Confirmation email enqueued:", data);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return new Response("Server not configured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Stripe signature verification failed:", msg);
    return new Response(`Webhook signature error: ${msg}`, { status: 400 });
  }

  console.log("Stripe event received:", event.type, event.id);

  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ received: true, ignored: event.type }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const product = session.metadata?.product;
  if (product !== "blue_door_diagnostic") {
    console.log("Ignoring non-Blue-Door session:", session.id, product);
    return new Response(JSON.stringify({ received: true, ignored: "non-blue-door" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  if (session.payment_status !== "paid") {
    console.log("Session not paid yet, ignoring:", session.id, session.payment_status);
    return new Response(JSON.stringify({ received: true, ignored: "unpaid" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  const email = (session.customer_details?.email || session.customer_email || session.metadata?.customer_email || "").trim().toLowerCase();
  const fullName = session.customer_details?.name || session.metadata?.customer_name || "";
  const company = session.metadata?.company || "";
  const amountFormatted = formatAmount(session.amount_total, session.currency);
  const amountValue = (session.amount_total ?? 0) / 100;
  const orderId = session.id;

  if (!email) {
    console.error("No email available on session:", session.id);
    return new Response(JSON.stringify({ received: true, error: "no_email" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  // Upsert first so we have contactId for opportunity + note
  const contactId = await upsertGhlContact({
    email, firstName, lastName, company, amountFormatted, orderId,
  });

  const sideEffects: Promise<unknown>[] = [
    sendConfirmationEmail({ email, firstName, company, amountFormatted, orderId }),
  ];

  if (contactId) {
    sideEffects.push(setContactStatusActive(contactId));
    sideEffects.push(
      createOpportunity({
        contactId,
        name: `Blue Door — ${fullName || email}`,
        monetaryValue: amountValue,
      })
    );
    sideEffects.push(
      appendNote(
        contactId,
        `Blue Door purchase recorded on ${todayForGHL()}.\n` +
        `Amount: ${amountFormatted}\n` +
        `Internal Product ID: ${BLUE_DOOR_INTERNAL_PRODUCT_ID}\n` +
        `Stripe Checkout Session: ${orderId}\n` +
        `Access link will be delivered May 18th, 2026.`
      )
    );
  }

  await Promise.allSettled(sideEffects);

  return new Response(JSON.stringify({ received: true, processed: true, session: orderId }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
