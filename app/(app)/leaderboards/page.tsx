'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LeaderboardTable } from '@/components/leaderboards/LeaderboardTable'
import { AroundMeRow } from '@/components/leaderboards/AroundMeRow'
import { formatModeName, getModeIcon } from '@/lib/utils/format'
import { getDateKey, getWeekKey } from '@/lib/game/seeds'

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

export default function LeaderboardsPage() {
  const searchParams = useSearchParams()
  const scope = searchParams.get('scope') || 'daily'

  const [dailyData, setDailyData] = useState<{
    entries: LeaderboardEntry[]
    around_me: { rank: number; score: number; total_entries: number } | null
  } | null>(null)
  const [weeklyData, setWeeklyData] = useState<{
    entries: LeaderboardEntry[]
    around_me: { rank: number; score: number; total_entries: number } | null
  } | null>(null)
  const [selectedMode, setSelectedMode] = useState('flash_grid')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboards()
  }, [selectedMode])

  const fetchLeaderboards = async () => {
    setLoading(true)

    try {
      const dateKey = getDateKey(new Date())
      const weekKey = getWeekKey(new Date())

      const [dailyResponse, weeklyResponse] = await Promise.all([
        fetch(`/api/leaderboards/daily?date=${dateKey}&mode=${selectedMode}`),
        fetch(`/api/leaderboards/weekly?week=${weekKey}`),
      ])

      const daily = await dailyResponse.json()
      const weekly = await weeklyResponse.json()

      if (!daily.error) setDailyData(daily)
      if (!weekly.error) setWeeklyData(weekly)
    } catch (err) {
      console.error('Failed to fetch leaderboards:', err)
    } finally {
      setLoading(false)
    }
  }

  const modes = ['flash_grid', 'sequence_forge', 'rotation_run']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leaderboards</h1>
        <p className="text-muted-foreground">
          See how you rank against other players
        </p>
      </div>

      <Tabs defaultValue={scope}>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Run</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          {/* Mode Selector */}
          <div className="flex gap-2">
            {modes.map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedMode === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {getModeIcon(mode)} {formatModeName(mode)}
              </button>
            ))}
          </div>

          {/* User's Rank */}
          {dailyData?.around_me && (
            <AroundMeRow
              rank={dailyData.around_me.rank}
              score={dailyData.around_me.score}
              accuracy={0}
              durationMs={0}
              totalEntries={dailyData.around_me.total_entries}
            />
          )}

          {/* Leaderboard Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getModeIcon(selectedMode)} {formatModeName(selectedMode)} - Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable
                entries={dailyData?.entries || []}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          {/* User's Rank */}
          {weeklyData?.around_me && (
            <AroundMeRow
              rank={weeklyData.around_me.rank}
              score={weeklyData.around_me.score}
              accuracy={0}
              durationMs={0}
              totalEntries={weeklyData.around_me.total_entries}
            />
          )}

          {/* Leaderboard Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏆 Weekly League Run
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable
                entries={weeklyData?.entries || []}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
