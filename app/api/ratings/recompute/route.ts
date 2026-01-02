import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const recomputeSchema = z.object({
  user_id: z.string().uuid(),
  mode: z.enum(['flash_grid', 'sequence_forge', 'rotation_run', 'weekly_run']),
})

export async function POST(request: NextRequest) {
  const { isAdmin } = await requireAdmin(request)

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body
  try {
    body = await request.json()
    body = recomputeSchema.parse(body)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { user_id, mode } = body
  const serviceClient = await createServiceClient()

  // Get all attempts for this user and mode
  const { data: attempts } = await serviceClient
    .from('attempts')
    .select('*')
    .eq('user_id', user_id)
    .eq('mode', mode)
    .order('created_at', { ascending: true })

  if (!attempts || attempts.length === 0) {
    return NextResponse.json({ ok: true, message: 'No attempts to recompute' })
  }

  // Reset rating to default
  await serviceClient
    .from('ratings')
    .update({
      pr: 1000,
      games_played: 0,
      wins: 0,
      losses: 0,
    })
    .eq('user_id', user_id)
    .eq('mode', mode)

  // Recompute PR for each attempt
  for (const attempt of attempts) {
    await serviceClient.rpc('update_pattern_rating', {
      p_user_id: user_id,
      p_mode: mode,
      p_score: attempt.score,
      p_tier: attempt.tier,
      p_success: attempt.success,
    })
  }

  return NextResponse.json({ ok: true })
}
