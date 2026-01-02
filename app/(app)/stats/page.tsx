import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/requireUser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/app/StatCard'
import { LeagueBadge } from '@/components/app/LeagueBadge'
import { formatModeName, getModeIcon } from '@/lib/utils/format'
import { BarChart3, Target, Zap, Trophy } from 'lucide-react'

export default async function StatsPage() {
  const user = await requireUser()
  const supabase = await createClient()

  // Get user's ratings
  const { data: ratings } = await supabase
    .from('ratings')
    .select('*')
    .eq('user_id', user.id)

  // Get recent attempts (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: recentAttempts } = await supabase
    .from('attempts')
    .select('mode, score, accuracy, duration_ms, success, created_at')
    .eq('user_id', user.id)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  const modes = ['flash_grid', 'sequence_forge', 'rotation_run']
  const averagePR = ratings?.length
    ? Math.round(ratings.reduce((sum, r) => sum + r.pr, 0) / ratings.length)
    : 1000

  const totalGames = ratings?.reduce((sum, r) => sum + r.games_played, 0) || 0
  const totalWins = ratings?.reduce((sum, r) => sum + r.wins, 0) || 0
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0

  const avgAccuracy = recentAttempts?.length
    ? Math.round(recentAttempts.reduce((sum, a) => sum + Number(a.accuracy), 0) / recentAttempts.length)
    : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Your Stats</h1>
        <p className="text-muted-foreground">
          Track your performance and progress
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Average PR"
          value={averagePR.toLocaleString()}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard
          title="Total Games"
          value={totalGames.toLocaleString()}
          icon={<Trophy className="h-4 w-4" />}
        />
        <StatCard
          title="Win Rate"
          value={`${winRate}%`}
          subtitle={`${totalWins}/${totalGames}`}
          icon={<Target className="h-4 w-4" />}
        />
        <StatCard
          title="Avg Accuracy (7d)"
          value={`${avgAccuracy}%`}
          icon={<Zap className="h-4 w-4" />}
        />
      </div>

      {/* Current League */}
      <Card>
        <CardHeader>
          <CardTitle>Current League</CardTitle>
        </CardHeader>
        <CardContent>
          <LeagueBadge pr={averagePR} showProgress size="lg" />
        </CardContent>
      </Card>

      {/* Per-Mode Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Stats by Mode</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {modes.map((mode) => {
            const rating = ratings?.find(r => r.mode === mode)
            const modeAttempts = recentAttempts?.filter(a => a.mode === mode) || []
            const modeAvgAccuracy = modeAttempts.length
              ? Math.round(modeAttempts.reduce((sum, a) => sum + Number(a.accuracy), 0) / modeAttempts.length)
              : 0
            const modeWinRate = rating && rating.games_played > 0
              ? Math.round((rating.wins / rating.games_played) * 100)
              : 0

            return (
              <Card key={mode}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span>{getModeIcon(mode)}</span>
                    {formatModeName(mode)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pattern Rating</span>
                    <span className="font-bold">{rating?.pr?.toLocaleString() || 1000}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Games Played</span>
                    <span className="font-medium">{rating?.games_played || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Win Rate</span>
                    <span className="font-medium">{modeWinRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Accuracy (7d)</span>
                    <span className="font-medium">{modeAvgAccuracy}%</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          In-game skill metrics are for entertainment purposes only.
          Not intended as medical or cognitive health assessments.
        </p>
      </div>
    </div>
  )
}
