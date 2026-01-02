import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { validateSubmitAttempt, getDurationFromEvents } from '@/lib/game/validateAttempt'
import { generateFlashGridChallenge, validateFlashGridAnswer } from '@/lib/game/generators/flashGrid'
import { generateSequenceForgeChallenge, validateSequenceForgeAnswer } from '@/lib/game/generators/sequenceForge'
import { generateRotationRunChallenge, validateRotationRunAnswer } from '@/lib/game/generators/rotationRun'
import { scoreFlashGrid } from '@/lib/game/scoring/flashGrid'
import { scoreSequenceForge } from '@/lib/game/scoring/sequenceForge'
import { scoreRotationRun } from '@/lib/game/scoring/rotationRun'
import { getLeague } from '@/lib/game/leagues'
import { captureServerEvent } from '@/lib/analytics/posthog-server'
import { EVENTS } from '@/lib/analytics/events'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const serviceClient = await createServiceClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse and validate request body
  let body
  try {
    body = await request.json()
    body = validateSubmitAttempt(body)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { challenge_issue_id, result, client_meta } = body

  // Get challenge issue
  const { data: challenge, error: challengeError } = await supabase
    .from('challenge_issues')
    .select('*')
    .eq('id', challenge_issue_id)
    .eq('user_id', user.id)
    .single()

  if (challengeError || !challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }

  // Validate challenge hasn't expired
  if (new Date(challenge.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Challenge has expired' }, { status: 400 })
  }

  // Validate challenge hasn't been consumed
  if (challenge.consumed_at) {
    return NextResponse.json({ error: 'Challenge already submitted' }, { status: 400 })
  }

  // Validate mode matches
  if (result.mode !== challenge.mode) {
    return NextResponse.json({ error: 'Mode mismatch' }, { status: 400 })
  }

  // Check weekly run limit for weekly challenges
  if (challenge.kind === 'weekly') {
    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('plan, status')
      .eq('user_id', user.id)
      .single()

    const isPaid = entitlement?.plan !== 'free' &&
      (entitlement?.status === 'active' || entitlement?.status === 'trialing')

    if (!isPaid) {
      const { data: runLimit } = await supabase
        .from('weekly_run_limits')
        .select('runs_used')
        .eq('user_id', user.id)
        .eq('week_key', challenge.date_key)
        .single()

      if ((runLimit?.runs_used || 0) >= 1) {
        return NextResponse.json({
          error: 'WEEKLY_RUN_LIMIT',
          message: 'Free users get 1 weekly run per week. Subscribe for unlimited runs.',
        }, { status: 402 })
      }
    }
  }

  // Regenerate challenge to validate
  let scoreResult

  switch (result.mode) {
    case 'flash_grid': {
      const durationMs = getDurationFromEvents(result.events)
      const regenerated = generateFlashGridChallenge(challenge.seed, challenge.tier)
      scoreResult = scoreFlashGrid(regenerated, result.answers, durationMs)
      break
    }
    case 'sequence_forge': {
      const durationMs = getDurationFromEvents(result.events)
      const regenerated = generateSequenceForgeChallenge(challenge.seed, challenge.tier)
      scoreResult = scoreSequenceForge(regenerated, result.answers, durationMs)
      break
    }
    case 'rotation_run': {
      const durationMs = getDurationFromEvents(result.events)
      const regenerated = generateRotationRunChallenge(challenge.seed, challenge.tier)
      scoreResult = scoreRotationRun(regenerated, result.answers, durationMs)
      break
    }
    case 'weekly_run':
      // Weekly run is handled by a separate endpoint
      return NextResponse.json({ error: 'Use /api/attempts/submit-weekly for weekly runs' }, { status: 400 })
    default:
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  }

  // Mark challenge as consumed
  await serviceClient
    .from('challenge_issues')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', challenge_issue_id)

  // Insert attempt
  const { data: attempt, error: attemptError } = await serviceClient
    .from('attempts')
    .insert({
      user_id: user.id,
      challenge_issue_id,
      kind: challenge.kind,
      mode: challenge.mode,
      date_key: challenge.date_key,
      tier: challenge.tier,
      seed: challenge.seed,
      score: scoreResult.score,
      accuracy: scoreResult.accuracy,
      duration_ms: scoreResult.durationMs,
      success: scoreResult.success,
      details: scoreResult.details,
      client_meta: client_meta || {},
    })
    .select()
    .single()

  if (attemptError) {
    console.error('Error inserting attempt:', attemptError)
    return NextResponse.json({ error: 'Failed to save attempt' }, { status: 500 })
  }

  // Update PR
  const { data: prUpdate } = await serviceClient.rpc('update_pattern_rating', {
    p_user_id: user.id,
    p_mode: challenge.mode,
    p_score: scoreResult.score,
    p_tier: challenge.tier,
    p_success: scoreResult.success,
  })

  const prResult = prUpdate?.[0] || { old_pr: 1000, new_pr: 1000, delta: 0 }

  // Update leaderboard
  await serviceClient.rpc('upsert_leaderboard_entry', {
    p_scope: challenge.kind,
    p_date_key: challenge.date_key,
    p_mode: challenge.mode,
    p_user_id: user.id,
    p_score: scoreResult.score,
    p_accuracy: scoreResult.accuracy,
    p_duration_ms: scoreResult.durationMs,
  })

  // Update weekly run limit for weekly challenges
  if (challenge.kind === 'weekly') {
    await serviceClient.rpc('increment_weekly_runs', {
      p_user_id: user.id,
      p_week_key: challenge.date_key,
    })
  }

  // Get league info
  const league = getLeague(prResult.new_pr)

  // Track analytics
  captureServerEvent(user.id, EVENTS.MODE_COMPLETED, {
    mode: challenge.mode,
    kind: challenge.kind,
    tier: challenge.tier,
    score: scoreResult.score,
    accuracy: scoreResult.accuracy,
    duration_ms: scoreResult.durationMs,
    success: scoreResult.success,
  })

  return NextResponse.json({
    attempt_id: attempt.id,
    mode: challenge.mode,
    kind: challenge.kind,
    date_key: challenge.date_key,
    tier: challenge.tier,
    score: scoreResult.score,
    accuracy: scoreResult.accuracy,
    duration_ms: scoreResult.durationMs,
    success: scoreResult.success,
    pr_update: {
      before: prResult.old_pr,
      after: prResult.new_pr,
      delta: prResult.delta,
    },
    league: {
      name: league.name,
      min_pr: league.minPR,
    },
    leaderboard: {
      scope: challenge.kind,
      mode: challenge.mode,
      date_key: challenge.date_key,
      placed: true,
    },
  })
}
