import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/requireUser'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModeCard } from '@/components/app/ModeCard'
import { StatCard } from '@/components/app/StatCard'
import { LeagueBadge } from '@/components/app/LeagueBadge'
import { CountdownToReset } from '@/components/app/CountdownToReset'
import { getDateKey, getDailyResetTime, getWeekKey, getWeeklyResetTime } from '@/lib/game/seeds'
import { formatModeName, getModeIcon } from '@/lib/utils/format'
import { Play, Trophy, BarChart3 } from 'lucide-react'

export default async function DashboardPage() {
  const user = await requireUser()
  const supabase = await createClient()

  const today = new Date()
  const dateKey = getDateKey(today)
  const weekKey = getWeekKey(today)

  // Get user's ratings
  const { data: ratings } = await supabase
    .from('ratings')
    .select('mode, pr, games_played')
    .eq('user_id', user.id)

  // Get today's attempts
  const { data: todayAttempts } = await supabase
    .from('attempts')
    .select('mode, score, accuracy, kind')
    .eq('user_id', user.id)
    .eq('date_key', dateKey)
    .eq('kind', 'daily')

  // Get weekly run status
  const { data: weeklyAttempts } = await supabase
    .from('attempts')
    .select('score, accuracy')
    .eq('user_id', user.id)
    .eq('date_key', weekKey)
    .eq('kind', 'weekly')
    .eq('mode', 'weekly_run')

  const completedModes = new Set(todayAttempts?.map(a => a.mode) || [])
  const averagePR = ratings?.length
    ? Math.round(ratings.reduce((sum, r) => sum + r.pr, 0) / ratings.length)
    : 1000
  const totalGames = ratings?.reduce((sum, r) => sum + r.games_played, 0) || 0
  const hasWeeklyRun = (weeklyAttempts?.length || 0) > 0

  const modes = ['flash_grid', 'sequence_forge', 'rotation_run']

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s your daily challenge status.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Pattern Rating"
          value={averagePR.toLocaleString()}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard
          title="Games Played"
          value={totalGames.toLocaleString()}
          icon={<Play className="h-4 w-4" />}
        />
        <StatCard
          title="Today's Progress"
          value={`${completedModes.size}/3`}
          subtitle="modes completed"
          icon={<Trophy className="h-4 w-4" />}
        />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current League
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LeagueBadge pr={averagePR} showProgress size="lg" />
          </CardContent>
        </Card>
      </div>

      {/* Daily 3-Pack */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Daily 3-Pack</h2>
            <CountdownToReset
              targetDate={getDailyResetTime(today)}
              label="Resets in"
            />
          </div>
          <Link href="/app/play">
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Play All
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {modes.map((mode) => {
            const attempt = todayAttempts?.find(a => a.mode === mode)
            return (
              <ModeCard
                key={mode}
                mode={mode}
                completed={!!attempt}
                score={attempt?.score}
                accuracy={attempt?.accuracy}
                href={`/app/play/${mode.replace('_', '-')}`}
                tier={3}
              />
            )
          })}
        </div>
      </section>

      {/* Weekly Run */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Weekly League Run</h2>
            <CountdownToReset
              targetDate={getWeeklyResetTime(today)}
              label="Resets in"
            />
          </div>
          <Link href="/app/run/weekly">
            <Button variant={hasWeeklyRun ? 'outline' : 'default'}>
              <Trophy className="h-4 w-4 mr-2" />
              {hasWeeklyRun ? 'View Results' : 'Start Run'}
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="py-6">
            {hasWeeklyRun ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Run Completed!</p>
                  <p className="text-sm text-muted-foreground">
                    Score: {weeklyAttempts?.[0]?.score?.toLocaleString()}
                  </p>
                </div>
                <Link href="/app/leaderboards?scope=weekly">
                  <Button variant="outline" size="sm">
                    View Leaderboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">🏆</div>
                <p className="font-medium">Chain all 3 modes for the ultimate challenge</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Compete for the best combined score this week
                </p>
                <Link href="/app/run/weekly">
                  <Button>Start Weekly Run</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Ratings by Mode */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Ratings</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {modes.map((mode) => {
            const rating = ratings?.find(r => r.mode === mode)
            return (
              <Card key={mode}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getModeIcon(mode)}</span>
                      <span className="font-medium">{formatModeName(mode)}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{rating?.pr?.toLocaleString() || 1000}</p>
                      <p className="text-xs text-muted-foreground">
                        {rating?.games_played || 0} games
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
