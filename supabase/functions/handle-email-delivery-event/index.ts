// Optional webhook endpoint for downstream email-delivery events.
//
// Accepts POSTs from either:
//   1. Lovable-signed sources (HMAC verified with LOVABLE_API_KEY), OR
//   2. Third-party providers using a shared secret in the
//      `x-delivery-webhook-secret` header (matched against the
//      `EMAIL_DELIVERY_WEBHOOK_SECRET` Supabase secret).
//
// The webhook appends a new row to `email_send_log` reflecting the
// provider's final delivery status. It NEVER updates existing rows — the
// log is append-only, and `message_id` correlates rows for one email.
//
// Provider-agnostic payload shape:
// {
//   "message_id": "transactional-<uuid>" | "<provider-id>",
//   "recipient_email": "user@example.com",
//   "event": "delivered" | "bounced" | "complained" | "deferred" | "failed" | "opened" | "clicked",
//   "template_name"?: "welcome",            // optional, falls back to "system"
//   "error_message"?: "550 mailbox full",   // optional human reason
//   "provider"?: "mailgun" | "resend" | ...,// optional, stored in metadata
//   "occurred_at"?: "2026-05-06T01:23:45Z", // optional, stored in metadata
//   "metadata"?: { ... }                    // optional, free-form
// }
//
// Returns 200 with `{ success: true }` for processed events, 200 with
// `{ ignored: true }` for events we intentionally don't log (e.g. opens
// when not enabled), and 4xx for malformed/unauthenticated requests.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { WebhookError, verifyWebhookRequest } from 'npm:@lovable.dev/webhooks-js'

interface DeliveryEventPayload {
  message_id?: string
  recipient_email: string
  event: string
  template_name?: string
  error_message?: string
  provider?: string
  occurred_at?: string
  metadata?: Record<string, unknown>
}

// Map provider event names to email_send_log status values.
// email_send_log.status CHECK constraint allows:
//   'pending','sent','suppressed','failed','bounced','complained','dlq'
// Anything else is recorded informationally but skipped from the log.
const EVENT_TO_STATUS: Record<string, string | null> = {
  delivered: 'sent',
  sent: 'sent',
  bounce: 'bounced',
  bounced: 'bounced',
  hard_bounce: 'bounced',
  soft_bounce: 'bounced',
  complaint: 'complained',
  complained: 'complained',
  spam: 'complained',
  unsubscribe: 'suppressed',
  unsubscribed: 'suppressed',
  failed: 'failed',
  failure: 'failed',
  permanent_failure: 'failed',
  temporary_failure: 'failed',
  deferred: 'pending',
  // Engagement events — not status-bearing, ignored by default
  open: null,
  opened: null,
  click: null,
  clicked: null,
}

function jsonResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function parsePayload(body: string): DeliveryEventPayload {
  const parsed = JSON.parse(body)
  // Support either { data: {...} } (Lovable convention) or flat payloads.
  const data = (parsed && typeof parsed === 'object' && 'data' in parsed)
    ? parsed.data
    : parsed
  if (!data || typeof data !== 'object') {
    throw new Error('Missing payload body')
  }
  const d = data as DeliveryEventPayload
  if (!d.recipient_email || !d.event) {
    throw new Error('Missing required fields: recipient_email, event')
  }
  return d
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const lovableKey = Deno.env.get('LOVABLE_API_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const sharedSecret = Deno.env.get('EMAIL_DELIVERY_WEBHOOK_SECRET')

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase env vars')
    return jsonResponse({ error: 'Server configuration error' }, 500)
  }

  // Read body once so we can try multiple auth strategies.
  const rawBody = await req.text()

  let payload: DeliveryEventPayload | null = null
  let authMethod: 'hmac' | 'shared_secret' | null = null

  // Strategy 1: shared-secret header (third-party providers)
  const providedSecret = req.headers.get('x-delivery-webhook-secret')
  if (sharedSecret && providedSecret && providedSecret === sharedSecret) {
    try {
      payload = parsePayload(rawBody)
      authMethod = 'shared_secret'
    } catch (err) {
      return jsonResponse({ error: (err as Error).message }, 400)
    }
  }

  // Strategy 2: Lovable HMAC verification (for first-party signed sources)
  if (!payload && lovableKey) {
    try {
      // Re-build a Request with the same body since verifyWebhookRequest reads it.
      const replay = new Request(req.url, {
        method: 'POST',
        headers: req.headers,
        body: rawBody,
      })
      const verified = await verifyWebhookRequest({
        req: replay,
        secret: lovableKey,
        parser: parsePayload,
      })
      payload = verified.payload
      authMethod = 'hmac'
    } catch (error) {
      if (error instanceof WebhookError) {
        // Fall through to 401 below if no other auth succeeded.
        console.warn('HMAC verification failed', { code: error.code })
      } else {
        console.error('Unexpected verification error', { error })
      }
    }
  }

  if (!payload || !authMethod) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const eventKey = payload.event.toLowerCase()
  const mappedStatus = eventKey in EVENT_TO_STATUS
    ? EVENT_TO_STATUS[eventKey]
    : undefined

  // Engagement events (open/click) are accepted but not logged as status.
  if (mappedStatus === null) {
    return jsonResponse({ ignored: true, reason: 'engagement_event' })
  }

  // Unknown event names — accept but don't log a bogus status.
  if (mappedStatus === undefined) {
    console.warn('Unknown delivery event', { event: payload.event })
    return jsonResponse({ ignored: true, reason: 'unknown_event' })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const normalizedEmail = payload.recipient_email.toLowerCase()

  const metadata: Record<string, unknown> = {
    ...(payload.metadata ?? {}),
    delivery_event: payload.event,
    auth_method: authMethod,
  }
  if (payload.provider) metadata.provider = payload.provider
  if (payload.occurred_at) metadata.occurred_at = payload.occurred_at

  const { error: insertError } = await supabase
    .from('email_send_log')
    .insert({
      message_id: payload.message_id ?? null,
      template_name: payload.template_name ?? 'system',
      recipient_email: normalizedEmail,
      status: mappedStatus,
      error_message: payload.error_message ?? null,
      metadata,
    })

  if (insertError) {
    console.error('Failed to insert delivery event', { error: insertError })
    return jsonResponse({ error: 'Failed to record event' }, 500)
  }

  console.log('Delivery event recorded', {
    event: payload.event,
    status: mappedStatus,
    has_message_id: !!payload.message_id,
    auth: authMethod,
  })

  return jsonResponse({ success: true, status: mappedStatus })
})
