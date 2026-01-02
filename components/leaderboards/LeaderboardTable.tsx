'use client'

import { motion } from 'framer-motion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatRank, formatScore, formatAccuracy } from '@/lib/utils/format'
import { formatDuration } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/format'

interface LeaderboardEntry {
  rank: number
  user: {
    id: string
    display_name: string
    avatar_url: string | null
  }
  score: number
  accuracy: number
  duration_ms: number
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
  loading?: boolean
}

export function LeaderboardTable({
  entries,
  currentUserId,
  loading = false,
}: LeaderboardTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-12 bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No entries yet. Be the first to submit a score!
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Rank</TableHead>
          <TableHead>Player</TableHead>
          <TableHead className="text-right">Score</TableHead>
          <TableHead className="text-right">Accuracy</TableHead>
          <TableHead className="text-right">Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry, index) => (
          <motion.tr
            key={entry.user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'border-b transition-colors hover:bg-muted/50',
              entry.user.id === currentUserId && 'bg-primary/5'
            )}
          >
            <TableCell className="font-medium">
              {formatRank(entry.rank)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {entry.user.avatar_url ? (
                  <img
                    src={entry.user.avatar_url}
                    alt={entry.user.display_name}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                    {entry.user.display_name[0].toUpperCase()}
                  </div>
                )}
                <span className={cn(
                  entry.user.id === currentUserId && 'font-medium'
                )}>
                  {entry.user.display_name}
                  {entry.user.id === currentUserId && (
                    <span className="ml-1 text-xs text-muted-foreground">(you)</span>
                  )}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatScore(entry.score)}
            </TableCell>
            <TableCell className="text-right">
              {formatAccuracy(entry.accuracy)}
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
              {formatDuration(entry.duration_ms)}
            </TableCell>
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  )
}
