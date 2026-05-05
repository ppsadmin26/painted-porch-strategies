// Admin-only: returns the full registry of system emails (auth + transactional)
// with rendered preview HTML, subject, and raw TSX source for each template.
import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { TEMPLATES as TX_TEMPLATES } from '../_shared/transactional-email-templates/registry.ts'

import { SignupEmail } from '../_shared/email-templates/signup.tsx'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'
import { MagicLinkEmail } from '../_shared/email-templates/magic-link.tsx'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'
import { EmailChangeEmail } from '../_shared/email-templates/email-change.tsx'
import { ReauthenticationEmail } from '../_shared/email-templates/reauthentication.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const SAMPLE_URL = 'https://pps-website.lovable.app'
const SAMPLE_EMAIL = 'user@example.test'

const AUTH_TEMPLATES: Record<
  string,
  {
    component: React.ComponentType<any>
    displayName: string
    subject: string
    sample: Record<string, unknown>
    file: string
    trigger: string
  }
> = {
  signup: {
    component: SignupEmail,
    displayName: 'Confirm signup',
    subject: 'Confirm your email',
    sample: { siteName: 'pps-website', siteUrl: SAMPLE_URL, recipient: SAMPLE_EMAIL, confirmationUrl: SAMPLE_URL },
    file: '_shared/email-templates/signup.tsx',
    trigger: 'When a new user signs up and email confirmation is required',
  },
  invite: {
    component: InviteEmail,
    displayName: 'Invite user',
    subject: "You've been invited",
    sample: { siteName: 'pps-website', siteUrl: SAMPLE_URL, confirmationUrl: SAMPLE_URL },
    file: '_shared/email-templates/invite.tsx',
    trigger: 'When an admin invites a user from the admin portal',
  },
  magiclink: {
    component: MagicLinkEmail,
    displayName: 'Magic link',
    subject: 'Your login link',
    sample: { siteName: 'pps-website', confirmationUrl: SAMPLE_URL },
    file: '_shared/email-templates/magic-link.tsx',
    trigger: 'When a user requests a passwordless magic-link login',
  },
  recovery: {
    component: RecoveryEmail,
    displayName: 'Reset password',
    subject: 'Reset your password',
    sample: { siteName: 'pps-website', confirmationUrl: SAMPLE_URL },
    file: '_shared/email-templates/recovery.tsx',
    trigger: 'When a user clicks "Forgot password" and requests a reset link',
  },
  email_change: {
    component: EmailChangeEmail,
    displayName: 'Confirm email change',
    subject: 'Confirm your new email',
    sample: { siteName: 'pps-website', email: SAMPLE_EMAIL, newEmail: SAMPLE_EMAIL, confirmationUrl: SAMPLE_URL },
    file: '_shared/email-templates/email-change.tsx',
    trigger: 'When a user updates their account email address',
  },
  reauthentication: {
    component: ReauthenticationEmail,
    displayName: 'Reauthentication code',
    subject: 'Your verification code',
    sample: { token: '123456' },
    file: '_shared/email-templates/reauthentication.tsx',
    trigger: 'When a sensitive action requires the user to reverify their identity',
  },
}

const TX_TRIGGERS: Record<string, string> = {
  'contact-confirmation': 'Sent to the visitor after they submit the /contact form',
  'contact-notification': 'Sent to the PPS team when a new /contact form is submitted',
  'easter-egg-notification': 'Sent to the team when someone finds and submits the Terms easter egg',
  'easter-egg-confirmation': 'Sent to the visitor who completed the Terms easter egg',
  'burnout-access': 'Sent when a visitor requests access to the burnout resources',
  'stractical-waitlist': 'Sent when someone joins the Stractical Leader waitlist',
  'pilot-training-replay': 'Sent after opt-in for the Pilot Training replay',
  'kick-the-habit-replay': 'Sent after opt-in for the Kick the Habit replay',
  'communicator-styles-replay': 'Sent after opt-in for the Communicator Styles replay',
  'strategic-canvas': 'Sent when someone downloads the Strategic Canvas resource',
  'change-readiness-roadmap': 'Sent when someone downloads the Change Readiness Roadmap',
  'change-comms-guide': 'Sent when someone downloads the Change Comms Guide',
  'blue-door-purchase-confirmation': 'Sent after a successful Blue Door ($1,500) Stripe purchase',
  'stoic-field-guide': 'Sent when someone downloads the Stoic Field Guide',
}

async function readSource(relPath: string): Promise<string | null> {
  try {
    const url = new URL(`../${relPath}`, import.meta.url)
    return await Deno.readTextFile(url)
  } catch (err) {
    console.error('Failed to read template source', relPath, err)
    return null
  }
}

async function fileMtime(relPath: string): Promise<string | null> {
  try {
    const url = new URL(`../${relPath}`, import.meta.url)
    const stat = await Deno.stat(url)
    return stat.mtime ? stat.mtime.toISOString() : null
  } catch {
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  // Auth: require admin
  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const admin = createClient(supabaseUrl, serviceKey)
  const { data: isAdmin } = await admin.rpc('is_admin', { _user_id: user.id })
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Optional: detail mode for a single template
  let detailKey: string | null = null
  let detailKind: 'auth' | 'transactional' | null = null
  if (req.method === 'POST') {
    try {
      const body = await req.json()
      if (body?.detail) {
        detailKey = String(body.detail)
        detailKind = body.kind === 'auth' ? 'auth' : 'transactional'
      }
    } catch { /* noop */ }
  }

  const items: Array<{
    key: string
    kind: 'auth' | 'transactional'
    displayName: string
    subject: string
    file: string
    status: 'ready' | 'preview_data_required' | 'render_failed'
    error?: string
    html?: string
    source?: string
    lastUpdated?: string | null
    trigger?: string
  }> = []

  // Auth templates
  for (const [key, entry] of Object.entries(AUTH_TEMPLATES)) {
    const lastUpdated = await fileMtime(entry.file)
    const trigger = entry.trigger
    if (detailKey && !(detailKind === 'auth' && detailKey === key)) {
      items.push({
        key, kind: 'auth', displayName: entry.displayName, subject: entry.subject,
        file: `supabase/functions/${entry.file}`, status: 'ready', lastUpdated, trigger,
      })
      continue
    }
    try {
      const html = await renderAsync(React.createElement(entry.component, entry.sample))
      const source = await readSource(entry.file)
      items.push({
        key, kind: 'auth', displayName: entry.displayName, subject: entry.subject,
        file: `supabase/functions/${entry.file}`, status: 'ready', html, source: source ?? undefined,
        lastUpdated, trigger,
      })
    } catch (err) {
      items.push({
        key, kind: 'auth', displayName: entry.displayName, subject: entry.subject,
        file: `supabase/functions/${entry.file}`, status: 'render_failed',
        error: err instanceof Error ? err.message : String(err), lastUpdated, trigger,
      })
    }
  }

  // Transactional templates
  for (const [key, entry] of Object.entries(TX_TEMPLATES)) {
    const displayName = entry.displayName || key
    const file = `supabase/functions/_shared/transactional-email-templates/${key}.tsx`
    const relFile = `_shared/transactional-email-templates/${key}.tsx`
    const lastUpdated = await fileMtime(relFile)
    const trigger = TX_TRIGGERS[key]
    if (detailKey && !(detailKind === 'transactional' && detailKey === key)) {
      const subject = typeof entry.subject === 'function'
        ? (entry.previewData ? entry.subject(entry.previewData) : '(dynamic)')
        : entry.subject
      items.push({
        key, kind: 'transactional', displayName, subject,
        file: `supabase/functions/${file.replace('supabase/functions/', '')}`,
        status: entry.previewData ? 'ready' : 'preview_data_required', lastUpdated, trigger,
      })
      continue
    }
    if (!entry.previewData) {
      const source = await readSource(relFile)
      items.push({
        key, kind: 'transactional', displayName,
        subject: typeof entry.subject === 'function' ? '(dynamic)' : entry.subject,
        file, status: 'preview_data_required', source: source ?? undefined, lastUpdated, trigger,
      })
      continue
    }
    try {
      const html = await renderAsync(React.createElement(entry.component, entry.previewData))
      const subject = typeof entry.subject === 'function'
        ? entry.subject(entry.previewData)
        : entry.subject
      const source = await readSource(relFile)
      items.push({
        key, kind: 'transactional', displayName, subject, file,
        status: 'ready', html, source: source ?? undefined, lastUpdated, trigger,
      })
    } catch (err) {
      items.push({
        key, kind: 'transactional', displayName,
        subject: typeof entry.subject === 'function' ? '(dynamic)' : entry.subject,
        file, status: 'render_failed',
        error: err instanceof Error ? err.message : String(err), lastUpdated, trigger,
      })
    }
  }

  return new Response(JSON.stringify({ items }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
