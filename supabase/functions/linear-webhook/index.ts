// Linear Webhook Receiver — Supabase Edge Function
// Receives POST from Linear, verifies signature, stores events in Supabase
// Deploy: supabase functions deploy linear-webhook

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts'

const WEBHOOK_SECRET = Deno.env.get('LINEAR_WEBHOOK_SECRET') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Verify Linear webhook signature
function verifySignature(body: string, signature: string): boolean {
  if (!WEBHOOK_SECRET || !signature) return false
  const hmac = createHmac('sha256', WEBHOOK_SECRET)
  hmac.update(body)
  const digest = hmac.digest('hex')
  return digest === signature
}

Deno.serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.text()
  const signature = req.headers.get('linear-signature') ?? ''

  // Verify signature
  if (!verifySignature(body, signature)) {
    console.error('[linear-webhook] Invalid signature')
    return new Response('Invalid signature', { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(body)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const action = payload.action as string
  const type = payload.type as string
  const data = payload.data as Record<string, unknown>

  console.log(`[linear-webhook] ${type}.${action}:`, data?.id ?? 'unknown')

  // Store the raw event
  const { error } = await supabase.from('linear_events').insert({
    event_type: `${type}.${action}`,
    payload: payload,
    linear_id: (data?.id ?? null) as string | null,
    processed: false,
  })

  if (error) {
    console.error('[linear-webhook] Insert failed:', error.message)
    return new Response('Storage error', { status: 500 })
  }

  // Process specific event types
  try {
    switch (type) {
      case 'Issue':
        await handleIssueEvent(action, data)
        break
      case 'Comment':
        await handleCommentEvent(action, data)
        break
      case 'IssueLabel':
        // Label added/removed — could trigger notifications
        break
      case 'Reaction':
        // Emoji reaction — could award XP
        break
    }
  } catch (e) {
    console.error('[linear-webhook] Processing error:', e)
    // Don't fail the webhook — event is stored for retry
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

// Handle issue events — status changes, assignments, etc.
async function handleIssueEvent(action: string, data: Record<string, unknown>) {
  if (action === 'update') {
    const changes = data.updatedFrom as Record<string, unknown> | undefined
    if (!changes) return

    // Status change — could trigger notifications
    if (changes.stateId) {
      const state = (data.state as Record<string, unknown>)?.name ?? 'Unknown'
      const title = data.title as string
      const assignee = (data.assignee as Record<string, unknown>)?.name ?? null

      // Store as notification for the assignee
      if (assignee) {
        await supabase.from('notifications').insert({
          type: 'issue_status_change',
          title: `${title} moved to ${state}`,
          body: `Issue status was changed`,
          metadata: { issueId: data.id, state, title },
        }).catch(() => {}) // Table may not exist yet
      }
    }

    // Assignment change
    if (changes.assigneeId) {
      const assignee = (data.assignee as Record<string, unknown>)?.name ?? 'Unassigned'
      const title = data.title as string

      await supabase.from('notifications').insert({
        type: 'issue_assigned',
        title: `Assigned to ${assignee}`,
        body: `${title} was assigned`,
        metadata: { issueId: data.id, assignee, title },
      }).catch(() => {})
    }
  }

  if (action === 'create') {
    // New issue created — could notify project leads
    const title = data.title as string
    const creator = (data.creator as Record<string, unknown>)?.name ?? 'Unknown'

    await supabase.from('notifications').insert({
      type: 'issue_created',
      title: `New issue: ${title}`,
      body: `Created by ${creator}`,
      metadata: { issueId: data.id, title, creator },
    }).catch(() => {})
  }
}

// Handle comment events
async function handleCommentEvent(action: string, data: Record<string, unknown>) {
  if (action === 'create') {
    const body = (data.body as string)?.slice(0, 200) ?? ''
    const user = (data.user as Record<string, unknown>)?.name ?? 'Unknown'
    const issueId = data.issueId as string

    await supabase.from('notifications').insert({
      type: 'comment_added',
      title: `${user} commented`,
      body: body,
      metadata: { issueId, user, commentId: data.id },
    }).catch(() => {})
  }
}
