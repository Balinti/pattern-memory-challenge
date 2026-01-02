'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatModeName, getModeIcon } from '@/lib/utils/format'
import { formatDuration } from '@/lib/utils/dates'

interface ScoreBreakdownProps {
  mode: string
  score: number
  accuracy: number
  durationMs: number
  success: boolean
  details?: Record<string, unknown>
  prUpdate?: {
    before: number
    after: number
    delta: number
  }
}

export function ScoreBreakdown({
  mode,
  score,
  accuracy,
  durationMs,
  success,
  details,
  prUpdate,
}: ScoreBreakdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>{getModeIcon(mode)}</span>
              {formatModeName(mode)}
            </CardTitle>
            <Badge variant={success ? 'success' : 'destructive'}>
              {success ? 'Success' : 'Failed'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Main Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <motion.p
                className="text-3xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
              >
                {score.toLocaleString()}
              </motion.p>
              <p className="text-sm text-muted-foreground">Score</p>
            </div>
            <div>
              <motion.p
                className="text-3xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                {accuracy.toFixed(1)}%
              </motion.p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
            <div>
              <motion.p
                className="text-3xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                {formatDuration(durationMs)}
              </motion.p>
              <p className="text-sm text-muted-foreground">Time</p>
            </div>
          </div>

          {/* PR Update */}
          {prUpdate && (
            <motion.div
              className="flex items-center justify-center gap-3 p-3 bg-muted rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-muted-foreground">PR:</span>
              <span className="font-medium">{prUpdate.before}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-bold">{prUpdate.after}</span>
              <span
                className={
                  prUpdate.delta > 0
                    ? 'text-green-600 font-medium'
                    : prUpdate.delta < 0
                    ? 'text-red-600 font-medium'
                    : 'text-muted-foreground'
                }
              >
                ({prUpdate.delta > 0 ? '+' : ''}
                {prUpdate.delta})
              </span>
            </motion.div>
          )}

          {/* Details */}
          {details && Object.keys(details).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Details</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(details).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
