import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, country_code')
    .eq('id', user.id)
    .single()

  // Get entitlement
  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('plan, status, current_period_end, trial_ends_at')
    .eq('user_id', user.id)
    .single()

  // Get ratings
  const { data: ratings } = await supabase
    .from('ratings')
    .select('mode, pr, games_played, wins, losses')
    .eq('user_id', user.id)

  return NextResponse.json({
    user: {
      id: profile?.id || user.id,
      display_name: profile?.display_name || user.email?.split('@')[0] || 'Player',
      avatar_url: profile?.avatar_url,
      country_code: profile?.country_code,
    },
    entitlement: entitlement || {
      plan: 'free',
      status: 'inactive',
      current_period_end: null,
    },
    ratings: ratings?.map(r => ({
      mode: r.mode,
      pr: r.pr,
      games_played: r.games_played,
    })) || [],
  })
}
