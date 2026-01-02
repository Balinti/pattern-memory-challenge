'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PaywallModal } from '@/components/app/PaywallModal'
import { Trophy, ArrowLeft, Play } from 'lucide-react'

export default function WeeklyRunPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weeklyData, setWeeklyData] = useState<{
    week_key: string
    free_runs_remaining: number
    challenge_issue_id?: string
  } | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    fetchWeeklyChallenge()
  }, [])

  const fetchWeeklyChallenge = async () => {
    try {
      const response = await fetch('/api/challenges/weekly')
      const data = await response.json()

      if (data.error === 'WEEKLY_RUN_LIMIT') {
        setShowPaywall(true)
        setWeeklyData({
          week_key: data.week_key || '',
          free_runs_remaining: 0,
        })
      } else if (data.error) {
        setError(data.message || data.error)
      } else {
        setWeeklyData(data)
      }
    } catch (err) {
      setError('Failed to load weekly challenge')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-6">
        <Link href="/app" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="text-center">
        <div className="text-5xl mb-4">🏆</div>
        <h1 className="text-3xl font-bold">Weekly League Run</h1>
        <p className="text-muted-foreground mt-2">
          Complete all 3 modes in sequence for the ultimate challenge
        </p>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => router.push('/app')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>This Week's Challenge</span>
              {weeklyData && (
                <Badge variant="secondary">
                  Week {weeklyData.week_key}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl mb-1">⚡</div>
                <p className="text-sm font-medium">Flash Grid</p>
                <p className="text-xs text-muted-foreground">Stage 1</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl mb-1">🔗</div>
                <p className="text-sm font-medium">Sequence Forge</p>
                <p className="text-xs text-muted-foreground">Stage 2</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl mb-1">🔄</div>
                <p className="text-sm font-medium">Rotation Run</p>
                <p className="text-xs text-muted-foreground">Stage 3</p>
              </div>
            </div>

            <div className="text-center pt-4">
              {weeklyData?.free_runs_remaining === 0 ? (
                <div>
                  <p className="text-muted-foreground mb-4">
                    You've used your free weekly run.
                    Upgrade for unlimited runs!
                  </p>
                  <Button onClick={() => setShowPaywall(true)}>
                    <Trophy className="h-4 w-4 mr-2" />
                    Unlock Unlimited Runs
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Free runs remaining: {weeklyData?.free_runs_remaining ?? 1}
                  </p>
                  <Button size="lg">
                    <Play className="h-4 w-4 mr-2" />
                    Start Weekly Run
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          Complete all stages without breaks. Your combined score will be ranked
          on the weekly leaderboard.
        </p>
      </div>

      <PaywallModal
        open={showPaywall}
        onOpenChange={setShowPaywall}
        trigger="weekly_limit"
      />
    </div>
  )
}
