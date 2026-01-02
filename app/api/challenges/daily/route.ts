import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getDateKey, getDailyResetTime, createDailySeed } from '@/lib/game/seeds'
import { generateFlashGridChallenge } from '@/lib/game/generators/flashGrid'
import { generateSequenceForgeChallenge } from '@/lib/game/generators/sequenceForge'
import { generateRotationRunChallenge } from '@/lib/game/generators/rotationRun'
import { getTierForMode } from '@/lib/game/tiers'

const MODES = ['flash_grid', 'sequence_forge', 'rotation_run'] as const
const DEFAULT_TIER = 3

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const serviceClient = await createServiceClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const dateParam = searchParams.get('date')
  const date = dateParam ? new Date(dateParam) : new Date()
  const dateKey = getDateKey(date)

  // Check if user already has challenges for this date
  const { data: existingChallenges } = await supabase
    .from('challenge_issues')
    .select('*')
    .eq('user_id', user.id)
    .eq('kind', 'daily')
    .eq('date_key', dateKey)
    .is('consumed_at', null)

  // If challenges exist and haven't expired, return them
  if (existingChallenges && existingChallenges.length === 3) {
    const allValid = existingChallenges.every(c => new Date(c.expires_at) > new Date())
    if (allValid) {
      return NextResponse.json({
        date_key: dateKey,
        items: existingChallenges.map(c => ({
          mode: c.mode,
          tier: c.tier,
          challenge_issue_id: c.id,
          seed: c.seed,
          params: c.params,
        })),
        resets_at: getDailyResetTime(date).toISOString(),
      })
    }
  }

  // Get tier from app config or use default
  const { data: tierConfig } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'daily_tier')
    .single()

  const tier = tierConfig?.value ? Number(tierConfig.value) : DEFAULT_TIER
  const expiresAt = getDailyResetTime(date)

  // Generate new challenges
  const challenges = MODES.map(mode => {
    const seed = createDailySeed(dateKey, mode, tier)
    let params: Record<string, unknown>

    switch (mode) {
      case 'flash_grid':
        params = generateFlashGridChallenge(seed, tier).params as Record<string, unknown>
        break
      case 'sequence_forge':
        params = generateSequenceForgeChallenge(seed, tier).params as Record<string, unknown>
        break
      case 'rotation_run':
        params = generateRotationRunChallenge(seed, tier).params as Record<string, unknown>
        break
    }

    return {
      user_id: user.id,
      kind: 'daily',
      mode,
      date_key: dateKey,
      tier,
      seed,
      params,
      expires_at: expiresAt.toISOString(),
    }
  })

  // Insert challenges using service client (bypasses RLS)
  const { data: insertedChallenges, error: insertError } = await serviceClient
    .from('challenge_issues')
    .insert(challenges)
    .select()

  if (insertError) {
    console.error('Error inserting challenges:', insertError)
    return NextResponse.json({ error: 'Failed to create challenges' }, { status: 500 })
  }

  return NextResponse.json({
    date_key: dateKey,
    items: insertedChallenges.map(c => ({
      mode: c.mode,
      tier: c.tier,
      challenge_issue_id: c.id,
      seed: c.seed,
      params: c.params,
    })),
    resets_at: expiresAt.toISOString(),
  })
}
