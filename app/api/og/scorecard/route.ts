import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { formatModeName, getModeIcon } from '@/lib/utils/format'
import { getLeague } from '@/lib/game/leagues'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const attemptId = searchParams.get('attempt_id')

  if (!attemptId) {
    return new Response('Missing attempt_id', { status: 400 })
  }

  try {
    const supabase = await createClient()

    // Get attempt data
    const { data: attempt } = await supabase
      .from('attempts')
      .select(`
        *,
        profiles:user_id (display_name, avatar_url)
      `)
      .eq('id', attemptId)
      .single()

    if (!attempt) {
      return new Response('Attempt not found', { status: 404 })
    }

    const league = getLeague(1000) // Default, would need PR from ratings

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f0f23',
            backgroundImage: 'linear-gradient(135deg, #1a1a3e 0%, #0f0f23 100%)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            <span style={{ fontSize: '48px' }}>🧠</span>
            <span
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#ffffff',
              }}
            >
              Pattern League
            </span>
          </div>

          {/* Mode */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <span style={{ fontSize: '40px' }}>{getModeIcon(attempt.mode)}</span>
            <span
              style={{
                fontSize: '28px',
                color: '#a0a0ff',
              }}
            >
              {formatModeName(attempt.mode)}
            </span>
          </div>

          {/* Score */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '32px',
            }}
          >
            <span
              style={{
                fontSize: '80px',
                fontWeight: 'bold',
                color: '#ffffff',
              }}
            >
              {attempt.score.toLocaleString()}
            </span>
            <span
              style={{
                fontSize: '24px',
                color: '#808080',
              }}
            >
              points
            </span>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: '48px',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#22c55e',
                }}
              >
                {attempt.accuracy.toFixed(1)}%
              </span>
              <span style={{ fontSize: '16px', color: '#808080' }}>Accuracy</span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#3b82f6',
                }}
              >
                {(attempt.duration_ms / 1000).toFixed(1)}s
              </span>
              <span style={{ fontSize: '16px', color: '#808080' }}>Time</span>
            </div>
          </div>

          {/* Player */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '20px', color: '#c0c0c0' }}>
              by {(attempt.profiles as { display_name: string })?.display_name || 'Player'}
            </span>
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              fontSize: '14px',
              color: '#606060',
            }}
          >
            patternleague.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('OG image error:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
