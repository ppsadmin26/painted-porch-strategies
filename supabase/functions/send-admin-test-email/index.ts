import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const ADMIN_EMAIL = (Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || '').trim()

    if (!ADMIN_EMAIL) {
      return new Response(
        JSON.stringify({ error: 'ADMIN_NOTIFICATION_EMAIL is not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Validate caller is admin
    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const token = authHeader.slice(7)
    const admin = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data: userData, error: userErr } = await admin.auth.getUser(token)
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const { data: profile } = await admin
      .from('profiles')
      .select('role, email')
      .eq('id', userData.user.id)
      .maybeSingle()
    if (!profile || profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let body: { recipient?: string; note?: string } = {}
    try { body = await req.json() } catch { /* allow empty */ }
    const recipient = (body.recipient || ADMIN_EMAIL).trim()
    const triggeredAt = new Date().toISOString()
    const idempotencyKey = `admin-test-${userData.user.id}-${Date.now()}`

    const { data: sendData, error: sendErr } = await admin.functions.invoke(
      'send-transactional-email',
      {
        body: {
          templateName: 'admin-test-notification',
          recipientEmail: recipient,
          idempotencyKey,
          templateData: {
            triggeredBy: profile.email || userData.user.email || 'admin',
            triggeredAt,
            note: body.note || 'Manual test from the admin email dashboard.',
          },
        },
      },
    )

    if (sendErr) {
      return new Response(
        JSON.stringify({ error: sendErr.message || 'send-transactional-email failed' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ ok: true, recipient, idempotencyKey, result: sendData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
