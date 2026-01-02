'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatRank, formatScore, formatAccuracy } from '@/lib/utils/format'
import { formatDuration } from '@/lib/utils/dates'

interface AroundMeRowProps {
  rank: number
  score: number
  accuracy: number
  durationMs: number
  totalEntries: number
}

export function AroundMeRow({
  rank,
  score,
  accuracy,
  durationMs,
  totalEntries,
}: AroundMeRowProps) {
  const percentile = ((totalEntries - rank + 1) / totalEntries) * 100

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{formatRank(rank)}</p>
              <p className="text-xs text-muted-foreground">Your Rank</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-sm text-muted-foreground">
              Top {percentile.toFixed(1)}% of {totalEntries.toLocaleString()} players
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Score: </span>
              <span className="font-medium">{formatScore(score)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Accuracy: </span>
              <span className="font-medium">{formatAccuracy(accuracy)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Time: </span>
              <span className="font-mono">{formatDuration(durationMs)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
