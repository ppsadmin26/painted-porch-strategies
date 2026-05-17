import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BLUE_DOOR_PRICE_ID = "price_1TC9ZSJ1thi7TAL7RgJGhDFR";

const validateStringField = (value: unknown, fieldName: string, maxLength: number, required: boolean = true): { valid: boolean; error?: string; sanitized?: string } => {
  if (!value || typeof value !== "string") {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true, sanitized: "" };
  }
  
  const trimmed = value.trim();
  
  if (required && trimmed.length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} is too long` };
  }
  
  return { valid: true, sanitized: trimmed };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, name, company } = body;
    
    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail.length > 320) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const nameValidation = validateStringField(name, "Name", 200, false);
    if (!nameValidation.valid) {
      return new Response(
        JSON.stringify({ error: nameValidation.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const companyValidation = validateStringField(company, "Company", 300, false);
    if (!companyValidation.valid) {
      return new Response(
        JSON.stringify({ error: companyValidation.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("Missing Stripe configuration");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: trimmedEmail, limit: 1 });
    let customerId: string | undefined;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: trimmedEmail,
        name: nameValidation.sanitized || undefined,
        metadata: {
          company: companyValidation.sanitized || "",
          source: "blue_door_diagnostic",
        },
      });
      customerId = customer.id;
    }

    const origin = req.headers.get("origin") || "https://pps-website.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: BLUE_DOOR_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "payment",
      // NOTE: payment_method_types intentionally omitted so Stripe uses the
      // payment methods enabled in the Stripe Dashboard (Settings -> Payment methods).
      success_url: `${origin}/pps/blue-door/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pps/blue-door/purchase`,
      // Allow buyers to apply promotion codes managed in the Stripe Dashboard
      allow_promotion_codes: true,
      // Require phone number at checkout
      phone_number_collection: { enabled: true },
      // Optional Business Tax ID (EIN/VAT) on the invoice
      tax_id_collection: { enabled: true },
      // Optional company name field at Stripe Checkout (in addition to what we prefill)
      custom_fields: [
        {
          key: "company_name",
          label: { type: "custom", custom: "Company name" },
          type: "text",
          optional: true,
        },
      ],
      // Auto-generate a hosted Stripe Invoice and email it to the buyer
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: "Blue Door Strategic Organizational Appraisal",
          metadata: {
            product: "blue_door_diagnostic",
            company: companyValidation.sanitized || "",
          },
          footer:
            "Thank you for opening your Blue Door. Your assessment access link will be emailed on launch day (June 15th, 2026). Questions? explore@onthepaintedporch.com",
          rendering_options: { amount_tax_display: "exclude_tax" },
        },
      },
      // NOTE: receipt_email intentionally omitted. The hosted invoice (enabled
      // above via invoice_creation) is emailed to the buyer and serves as
      // their proof of payment. Setting receipt_email here would cause Stripe
      // to send a separate receipt email in addition to the invoice.
      payment_intent_data: {
        description: "Blue Door Strategic Organizational Appraisal",
      },
      // Keep the Stripe customer record in sync with what they enter at checkout
      customer_update: {
        name: "auto",
        address: "auto",
      },
      billing_address_collection: "auto",
      metadata: {
        customer_name: nameValidation.sanitized || "",
        customer_email: trimmedEmail,
        company: companyValidation.sanitized || "",
        product: "blue_door_diagnostic",
      },
    });

    console.log("Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error instanceof Error ? error.message : "Unknown error");
    return new Response(
      JSON.stringify({ error: "Unable to create checkout session" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
