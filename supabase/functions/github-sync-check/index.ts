// GitHub sync check - fetches latest commit via GitHub API and validates freshness.
// Used for: manual admin trigger, scheduled cron freshness check.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const TOKEN = Deno.env.get('GITHUB_TOKEN') ?? ''
const REPO = Deno.env.get('GITHUB_REPO') ?? ''
const BACKUP_CRON_SECRET = Deno.env.get('BACKUP_CRON_SECRET') ?? ''

const ALERT_EMAILS = ['admin@paintedporchstrategies.com', 'operations@paintedporchstrategies.com']
const STALE_HOURS = 72 // alert if no commit activity in this window
const ALERT_COOLDOWN_MS = 30 * 60 * 1000

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const url = new URL(req.url)
    const cronToken = url.searchParams.get('cron_token') ?? req.headers.get('x-cron-token') ?? ''
    const isCron = !!BACKUP_CRON_SECRET && cronToken === BACKUP_CRON_SECRET
    let source: 'manual' | 'cron' = isCron ? 'cron' : 'manual'

    // Authorize: cron via secret, otherwise admin/editor JWT
    if (!isCron) {
      const auth = req.headers.get('Authorization') ?? ''
      const jwt = auth.replace(/^Bearer\s+/i, '')
      if (!jwt) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: `Bearer ${jwt}` } } })
      const { data: u } = await userClient.auth.getUser()
      if (!u?.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      const admin = createClient(SUPABASE_URL, SERVICE_KEY)
      const { data: ok } = await admin.rpc('is_admin_or_editor', { _user_id: u.user.id })
      if (!ok) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const now = new Date()
    const nowIso = now.toISOString()

    if (!REPO || !TOKEN) {
      const msg = 'GITHUB_REPO or GITHUB_TOKEN not configured'
      await supabase.from('github_sync_events').insert({ source, event_type: 'check', status: 'failure', message: msg })
      return new Response(JSON.stringify({ ok: false, error: msg }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Fetch latest commit on default branch
    const repoRes = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'pps-sync-monitor' },
    })
    if (!repoRes.ok) {
      const txt = await repoRes.text()
      const msg = `GitHub API repo lookup failed: ${repoRes.status}`
      await supabase.from('github_sync_events').insert({ source, event_type: 'check', status: 'failure', message: msg, payload: { body: txt.slice(0, 500) } })
      await markFailure(supabase, msg, source, nowIso)
      return new Response(JSON.stringify({ ok: false, error: msg }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const repoJson = await repoRes.json()
    const branch = repoJson.default_branch ?? 'main'

    const commitRes = await fetch(`https://api.github.com/repos/${REPO}/commits/${branch}`, {
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'pps-sync-monitor' },
    })
    if (!commitRes.ok) {
      const msg = `GitHub commits API failed: ${commitRes.status}`
      await supabase.from('github_sync_events').insert({ source, event_type: 'check', status: 'failure', message: msg })
      await markFailure(supabase, msg, source, nowIso)
      return new Response(JSON.stringify({ ok: false, error: msg }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const commit = await commitRes.json()
    const commitDate = commit?.commit?.author?.date ?? commit?.commit?.committer?.date
    const ageHours = commitDate ? (now.getTime() - new Date(commitDate).getTime()) / 36e5 : null

    // Latest workflow run
    let wfStatus: string | null = null
    let wfConclusion: string | null = null
    try {
      const wfRes = await fetch(`https://api.github.com/repos/${REPO}/actions/runs?per_page=1`, {
        headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'pps-sync-monitor' },
      })
      if (wfRes.ok) {
        const wfJson = await wfRes.json()
        const run = wfJson?.workflow_runs?.[0]
        wfStatus = run?.status ?? null
        wfConclusion = run?.conclusion ?? null
      }
    } catch {}

    let isStale = ageHours !== null && ageHours > STALE_HOURS && source === 'cron'
    let wfFailed = wfConclusion === 'failure' || wfConclusion === 'timed_out'

    const message = wfFailed
      ? `Latest workflow concluded: ${wfConclusion}`
      : isStale
        ? `No commits in ${ageHours?.toFixed(0)}h on ${branch}`
        : `Healthy. Last commit ${ageHours?.toFixed(1) ?? '?'}h ago on ${branch}.`

    await supabase.from('github_sync_events').insert({
      source, event_type: 'check', status: (wfFailed || isStale) ? 'failure' : 'success', message,
      payload: { branch, commit_sha: commit?.sha, commit_date: commitDate, workflow_status: wfStatus, workflow_conclusion: wfConclusion },
    })

    if (wfFailed || isStale) {
      await markFailure(supabase, message, source, nowIso)
    } else {
      await supabase.from('github_sync_status').update({
        status: 'healthy', last_success_at: nowIso, last_check_at: nowIso,
        last_error_message: null, updated_at: nowIso,
        details: { branch, commit_sha: commit?.sha, commit_date: commitDate, workflow_status: wfStatus, workflow_conclusion: wfConclusion },
      }).eq('id', 1)
    }

    return new Response(JSON.stringify({ ok: true, status: (wfFailed || isStale) ? 'error' : 'healthy', message, branch, commit_sha: commit?.sha, commit_date: commitDate, workflow_status: wfStatus, workflow_conclusion: wfConclusion }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('github-sync-check error', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

async function markFailure(supabase: any, message: string, source: string, nowIso: string) {
  const { data: cur } = await supabase.from('github_sync_status').select('last_alert_sent_at').eq('id', 1).maybeSingle()
  await supabase.from('github_sync_status').update({
    status: 'error', last_failure_at: nowIso, last_check_at: nowIso,
    last_error_message: message, updated_at: nowIso,
  }).eq('id', 1)
  const lastAlert = cur?.last_alert_sent_at ? new Date(cur.last_alert_sent_at).getTime() : 0
  if (Date.now() - lastAlert > ALERT_COOLDOWN_MS) {
    for (const to of ALERT_EMAILS) {
      await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'github-sync-alert',
          recipientEmail: to,
          idempotencyKey: `gh-sync-check-${nowIso}-${to}`,
          templateData: { source, eventType: 'commit_freshness/workflow', errorMessage: message, detectedAt: nowIso, repo: REPO, adminUrl: 'https://paintedporchstrategies.com/admin/emails/queue' },
        },
      }).catch(() => {})
    }
    await supabase.from('github_sync_status').update({ last_alert_sent_at: nowIso }).eq('id', 1)
  }
}
