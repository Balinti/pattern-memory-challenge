import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWeekKey } from '@/lib/game/seeds'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const searchParams = request.nextUrl.searchParams
  const weekParam = searchParams.get('week')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

  const weekKey = weekParam || getWeekKey(new Date())

  // Get leaderboard entries
  const { data: entries, error } = await supabase.rpc('get_leaderboard', {
    p_scope: 'weekly',
    p_date_key: weekKey,
    p_mode: 'weekly_run',
    p_limit: limit,
    p_offset: 0,
  })

  if (error) {
    console.error('Error fetching weekly leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }

  // Get user's rank if authenticated
  let aroundMe = null
  if (user) {
    const { data: userRank } = await supabase.rpc('get_user_rank', {
      p_scope: 'weekly',
      p_date_key: weekKey,
      p_mode: 'weekly_run',
      p_user_id: user.id,
    })

    if (userRank?.[0]) {
      aroundMe = {
        rank: userRank[0].rank,
        score: userRank[0].score,
        total_entries: userRank[0].total_entries,
      }
    }
  }

  return NextResponse.json({
    scope: 'weekly',
    week_key: weekKey,
    mode: 'weekly_run',
    entries: entries?.map((e: Record<string, unknown>) => ({
      rank: e.rank,
      user: {
        id: e.user_id,
        display_name: e.display_name,
        avatar_url: e.avatar_url,
      },
      score: e.score,
      accuracy: e.accuracy,
      duration_ms: e.duration_ms,
    })) || [],
    around_me: aroundMe,
  })
}
