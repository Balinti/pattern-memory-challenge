import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/requireUser'
import { ModeCard } from '@/components/app/ModeCard'
import { CountdownToReset } from '@/components/app/CountdownToReset'
import { getDateKey, getDailyResetTime } from '@/lib/game/seeds'

export default async function PlayPage() {
  const user = await requireUser()
  const supabase = await createClient()

  const today = new Date()
  const dateKey = getDateKey(today)

  // Get today's attempts
  const { data: todayAttempts } = await supabase
    .from('attempts')
    .select('mode, score, accuracy')
    .eq('user_id', user.id)
    .eq('date_key', dateKey)
    .eq('kind', 'daily')

  const modes = ['flash_grid', 'sequence_forge', 'rotation_run']

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Daily 3-Pack</h1>
        <p className="text-muted-foreground">
          Complete all three modes to maximize your daily score.
        </p>
        <div className="mt-2">
          <CountdownToReset
            targetDate={getDailyResetTime(today)}
            label="New challenges in"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
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

      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          In-game skill metrics are for entertainment purposes only.
          Not intended as medical or cognitive health assessments.
        </p>
      </div>
    </div>
  )
}
