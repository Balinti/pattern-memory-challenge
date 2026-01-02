'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlashGridGame } from '@/components/game/FlashGridGame'
import { ScoreBreakdown } from '@/components/app/ScoreBreakdown'
import { ShareScoreCardButton } from '@/components/app/ShareScoreCardButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface ChallengeData {
  mode: string
  tier: number
  challenge_issue_id: string
  seed: string
  params: {
    gridSize: number
    colors: number
    tiles: number
    exposureMs: number
  }
}

interface ResultData {
  attempt_id: string
  score: number
  accuracy: number
  duration_ms: number
  success: boolean
  pr_update: {
    before: number
    after: number
    delta: number
  }
}

export default function FlashGridPage() {
  const router = useRouter()
  const [challenge, setChallenge] = useState<ChallengeData | null>(null)
  const [result, setResult] = useState<ResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChallenge()
  }, [])

  const fetchChallenge = async () => {
    try {
      const response = await fetch('/api/challenges/daily')
      const data = await response.json()

      if (data.error) {
        setError(data.error)
        return
      }

      const flashGrid = data.items.find((item: ChallengeData) => item.mode === 'flash_grid')
      if (flashGrid) {
        setChallenge(flashGrid)
      } else {
        setError('Challenge not found')
      }
    } catch (err) {
      setError('Failed to load challenge')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (answers: number[][], events: Array<{ t: number; type: string }>) => {
    if (!challenge) return

    try {
      const response = await fetch('/api/attempts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_issue_id: challenge.challenge_issue_id,
          result: {
            mode: 'flash_grid',
            answers,
            events,
          },
          client_meta: {
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
            ua: navigator.userAgent,
          },
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        return
      }

      setResult(data)
    } catch (err) {
      setError('Failed to submit result')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => router.push('/app/play')}>
          Back to Play
        </Button>
      </div>
    )
  }

  if (result) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <ScoreBreakdown
          mode="flash_grid"
          score={result.score}
          accuracy={result.accuracy}
          durationMs={result.duration_ms}
          success={result.success}
          prUpdate={result.pr_update}
        />

        <div className="flex items-center justify-between">
          <Link href="/app/play">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>

          <ShareScoreCardButton
            attemptId={result.attempt_id}
            score={result.score}
            mode="Flash Grid"
          />

          <Link href="/app/play/sequence-forge">
            <Button>
              Next Mode
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No challenge available</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/app/play" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Daily 3-Pack
        </Link>
      </div>

      <Card>
        <CardContent className="py-8">
          <FlashGridGame
            params={challenge.params}
            seed={challenge.seed}
            onComplete={handleComplete}
          />
        </CardContent>
      </Card>
    </div>
  )
}
