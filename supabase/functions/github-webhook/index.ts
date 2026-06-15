// GitHub webhook receiver - validates signature, records events, alerts on failures.
// Public endpoint (no JWT) - GitHub signs payload with shared secret.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hub-signature-256, x-github-event, x-github-delivery',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SECRET = Deno.env.get('GITHUB_WEBHOOK_SECRET') ?? ''
const REPO = Deno.env.get('GITHUB_REPO') ?? ''

const ALERT_EMAILS = ['admin@paintedporchstrategies.com', 'operations@paintedporchstrategies.com']
const ALERT_COOLDOWN_MS = 30 * 60 * 1000 // 30 min

async function verify(secret: string, body: string, sigHeader: string): Promise<boolean> {
  if (!sigHeader?.startsWith('sha256=')) return false
  const expected = sigHeader.slice(7)
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(body))
  const hex = Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, '0')).join('')
  if (hex.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const raw = await req.text()
    const sig = req.headers.get('x-hub-signature-256') ?? ''
    const event = req.headers.get('x-github-event') ?? 'unknown'

    if (!SECRET) {
      return new Response(JSON.stringify({ error: 'webhook secret not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const ok = await verify(SECRET, raw, sig)
    if (!ok) {
      return new Response(JSON.stringify({ error: 'invalid signature' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const payload = raw ? JSON.parse(raw) : {}
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    // Determine pass/fail.
    //
    // IMPORTANT: "Sync" here means Lovable<->GitHub code replication, NOT CI
    // test results. Test workflows (a11y, unit tests, visual regression,
    // b2c-quiz-e2e, etc.) failing does not mean sync is broken — they're just
    // failing tests on already-synced code. Real sync health is checked by
    // the scheduled `github-sync-check` function.
    //
    // So: we still LOG workflow_run / check_suite / check_run events for
    // visibility, but we do NOT flip sync status to error or fire the
    // "GitHub sync issue" email for them. Only push/ping affect sync status.
    let status: 'success' | 'failure' | 'info' = 'info'
    let message = `${event}`
    let isFailure = false

    if (event === 'ping') {
      status = 'success'
      message = 'GitHub webhook ping received'
    } else if (event === 'push') {
      status = 'success'
      message = `Push to ${payload?.ref ?? '?'} by ${payload?.pusher?.name ?? '?'}`
    } else if (event === 'workflow_run') {
      const conclusion = payload?.workflow_run?.conclusion
      const action = payload?.action
      const name = payload?.workflow_run?.name ?? 'workflow'
      if (action === 'completed') {
        if (conclusion === 'success') {
          message = `Workflow "${name}" succeeded`
        } else if (conclusion && conclusion !== 'skipped' && conclusion !== 'cancelled') {
          // Logged as info, not failure — CI test failure is not a sync failure.
          message = `Workflow "${name}" concluded: ${conclusion} (CI test result, not a sync issue)`
        }
      }
    } else if (event === 'check_run' || event === 'check_suite') {
      const conclusion = payload?.[event]?.conclusion
      if (conclusion) {
        message = `${event}: ${conclusion} (CI check result, not a sync issue)`
      }
    }

    await supabase.from('github_sync_events').insert({
      source: 'webhook', event_type: event, status, message,
      payload: { delivery: req.headers.get('x-github-delivery'), action: payload?.action ?? null },
    })

    // Update sync status
    const now = new Date().toISOString()
    if (isFailure) {
      const { data: cur } = await supabase.from('github_sync_status').select('last_alert_sent_at').eq('id', 1).maybeSingle()
      await supabase.from('github_sync_status').update({
        status: 'error', last_failure_at: now, last_check_at: now,
        last_error_message: message, updated_at: now,
      }).eq('id', 1)

      const lastAlert = cur?.last_alert_sent_at ? new Date(cur.last_alert_sent_at).getTime() : 0
      if (Date.now() - lastAlert > ALERT_COOLDOWN_MS) {
        for (const to of ALERT_EMAILS) {
          await supabase.functions.invoke('send-transactional-email', {
            body: {
              templateName: 'github-sync-alert',
              recipientEmail: to,
              idempotencyKey: `gh-sync-${req.headers.get('x-github-delivery') ?? crypto.randomUUID()}-${to}`,
              templateData: { source: 'webhook', eventType: event, errorMessage: message, detectedAt: now, repo: REPO, adminUrl: 'https://paintedporchstrategies.com/admin/emails/queue' },
            },
          }).catch(() => {})
        }
        await supabase.from('github_sync_status').update({ last_alert_sent_at: now }).eq('id', 1)
      }
    } else if (status === 'success') {
      await supabase.from('github_sync_status').update({
        status: 'healthy', last_success_at: now, last_check_at: now, updated_at: now,
      }).eq('id', 1)
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('github-webhook error', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
