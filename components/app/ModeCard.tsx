'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Play, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatModeName, getModeIcon, getModeDescription } from '@/lib/utils/format'

interface ModeCardProps {
  mode: string
  completed?: boolean
  score?: number
  accuracy?: number
  href: string
  locked?: boolean
  tier?: number
}

export function ModeCard({
  mode,
  completed = false,
  score,
  accuracy,
  href,
  locked = false,
  tier,
}: ModeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`relative overflow-hidden ${completed ? 'border-green-500/50' : ''}`}>
        {completed && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white">
              <Check className="h-4 w-4" />
            </div>
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getModeIcon(mode)}</span>
            <CardTitle className="text-lg">{formatModeName(mode)}</CardTitle>
          </div>
          {tier && (
            <Badge variant="secondary" className="w-fit">
              Tier {tier}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {getModeDescription(mode)}
          </p>

          {completed && score !== undefined && (
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Score: </span>
                <span className="font-semibold">{score.toLocaleString()}</span>
              </div>
              {accuracy !== undefined && (
                <div>
                  <span className="text-muted-foreground">Accuracy: </span>
                  <span className="font-semibold">{accuracy.toFixed(1)}%</span>
                </div>
              )}
            </div>
          )}

          {locked ? (
            <Button disabled className="w-full" variant="secondary">
              <Lock className="h-4 w-4 mr-2" />
              Locked
            </Button>
          ) : completed ? (
            <Link href={href}>
              <Button variant="outline" className="w-full">
                View Results
              </Button>
            </Link>
          ) : (
            <Link href={href}>
              <Button className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Play Now
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
