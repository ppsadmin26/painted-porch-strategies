import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

function json(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (!supabaseUrl || !serviceKey || !anonKey) return json({ error: 'Server config error' }, 500)

  // Verify caller is an authenticated admin
  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'Unauthorized' }, 401)

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: userData, error: userErr } = await userClient.auth.getUser()
  if (userErr || !userData?.user) return json({ error: 'Unauthorized' }, 401)
  const userId = userData.user.id

  const admin = createClient(supabaseUrl, serviceKey)
  const { data: profile, error: profileErr } = await admin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()
  if (profileErr || profile?.role !== 'admin') return json({ error: 'Forbidden' }, 403)

  let body: any
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const sections: string[] = Array.isArray(body?.sections) ? body.sections.filter((s: unknown) => typeof s === 'string') : []
  const summary: string = typeof body?.summary === 'string' ? body.summary.trim() : ''
  const dryRun: boolean = body?.dryRun === true

  if (!sections.length) return json({ error: 'sections is required' }, 400)
  if (summary.length < 10) return json({ error: 'summary too short' }, 400)
  if (summary.length > 2000) return json({ error: 'summary too long' }, 400)

  // Build recipient list: unique emails from email_unsubscribe_tokens
  // that are NOT in suppressed_emails.
  const { data: tokens, error: tokensErr } = await admin
    .from('email_unsubscribe_tokens')
    .select('email')
  if (tokensErr) return json({ error: 'Failed to load recipients' }, 500)

  const { data: suppressed } = await admin
    .from('suppressed_emails')
    .select('email')
  const suppressedSet = new Set((suppressed ?? []).map((r: any) => String(r.email).toLowerCase()))

  const recipients = Array.from(
    new Set((tokens ?? []).map((r: any) => String(r.email).toLowerCase()).filter(Boolean))
  ).filter((e) => !suppressedSet.has(e))

  if (dryRun) {
    return json({ ok: true, dryRun: true, recipient_count: recipients.length })
  }

  // Insert audit row first so we have an ID for idempotency keys
  const { data: notif, error: notifErr } = await admin
    .from('policy_update_notifications')
    .insert({
      sent_by: userId,
      sections,
      summary,
      recipient_count: recipients.length,
      source: 'email_unsubscribe_tokens',
    })
    .select('id')
    .single()
  if (notifErr || !notif) return json({ error: 'Failed to create notification record' }, 500)

  const notificationId = notif.id
  const updatedAt = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  // Enqueue one send per recipient via existing transactional email pipeline.
  // The pipeline handles suppression rechecks, retries, and unsubscribe footer.
  let queued = 0
  let failed = 0
  for (const email of recipients) {
    const { error } = await admin.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'policy-update-notification',
        recipientEmail: email,
        idempotencyKey: `policy-update-${notificationId}-${email}`,
        templateData: { sections, summary, updatedAt },
      },
    })
    if (error) {
      failed += 1
      console.error('Enqueue failed', { email, error })
    } else {
      queued += 1
    }
  }

  return json({
    ok: true,
    notification_id: notificationId,
    recipient_count: recipients.length,
    queued,
    failed,
  })
})
