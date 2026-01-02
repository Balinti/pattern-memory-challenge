import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getWeekKey, getWeeklyResetTime, createWeeklySeed } from '@/lib/game/seeds'
import { generateWeeklyRunChallenge } from '@/lib/game/generators/weeklyRun'

const DEFAULT_TIER = 3
const FREE_WEEKLY_RUNS = 1

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const serviceClient = await createServiceClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const weekParam = searchParams.get('week')
  const date = weekParam ? new Date(weekParam.replace('-W', '-')) : new Date()
  const weekKey = weekParam || getWeekKey(date)

  // Check user's entitlement
  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('plan, status')
    .eq('user_id', user.id)
    .single()

  const isPaid = entitlement?.plan !== 'free' &&
    (entitlement?.status === 'active' || entitlement?.status === 'trialing')

  // Check weekly run usage
  const { data: runLimit } = await supabase
    .from('weekly_run_limits')
    .select('runs_used')
    .eq('user_id', user.id)
    .eq('week_key', weekKey)
    .single()

  const runsUsed = runLimit?.runs_used || 0
  const freeRunsRemaining = isPaid ? Infinity : Math.max(0, FREE_WEEKLY_RUNS - runsUsed)

  // Check if user has an unconsumed challenge for this week
  const { data: existingChallenge } = await supabase
    .from('challenge_issues')
    .select('*')
    .eq('user_id', user.id)
    .eq('kind', 'weekly')
    .eq('mode', 'weekly_run')
    .eq('date_key', weekKey)
    .is('consumed_at', null)
    .single()

  if (existingChallenge && new Date(existingChallenge.expires_at) > new Date()) {
    return NextResponse.json({
      week_key: weekKey,
      mode: 'weekly_run',
      tier: existingChallenge.tier,
      challenge_issue_id: existingChallenge.id,
      seed: existingChallenge.seed,
      params: existingChallenge.params,
      free_runs_remaining: freeRunsRemaining,
      resets_at: getWeeklyResetTime(date).toISOString(),
    })
  }

  // Check if user can start a new run
  if (!isPaid && runsUsed >= FREE_WEEKLY_RUNS) {
    return NextResponse.json({
      error: 'WEEKLY_RUN_LIMIT',
      message: 'Free users get 1 weekly run per week. Subscribe for unlimited runs.',
      free_runs_remaining: 0,
      resets_at: getWeeklyResetTime(date).toISOString(),
    }, { status: 402 })
  }

  // Get tier from config
  const { data: tierConfig } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'weekly_tier')
    .single()

  const tier = tierConfig?.value ? Number(tierConfig.value) : DEFAULT_TIER
  const expiresAt = getWeeklyResetTime(date)
  const seed = createWeeklySeed(weekKey, tier, runsUsed)

  // Generate weekly run challenge
  const challenge = generateWeeklyRunChallenge(seed, tier)

  // Insert challenge
  const { data: insertedChallenge, error: insertError } = await serviceClient
    .from('challenge_issues')
    .insert({
      user_id: user.id,
      kind: 'weekly',
      mode: 'weekly_run',
      date_key: weekKey,
      tier,
      seed,
      params: challenge.params,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error inserting weekly challenge:', insertError)
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 })
  }

  return NextResponse.json({
    week_key: weekKey,
    mode: 'weekly_run',
    tier: insertedChallenge.tier,
    challenge_issue_id: insertedChallenge.id,
    seed: insertedChallenge.seed,
    params: insertedChallenge.params,
    free_runs_remaining: isPaid ? Infinity : FREE_WEEKLY_RUNS - runsUsed,
    resets_at: expiresAt.toISOString(),
  })
}
