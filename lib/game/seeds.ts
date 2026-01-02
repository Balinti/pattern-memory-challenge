import seedrandom from 'seedrandom'

export type GameMode = 'flash_grid' | 'sequence_forge' | 'rotation_run' | 'weekly_run'
export type ChallengeKind = 'daily' | 'weekly' | 'practice'

export function createDailySeed(date: string, mode: GameMode, tier: number): string {
  return `${date}|${mode}|tier${tier}`
}

export function createWeeklySeed(weekKey: string, tier: number, runIndex: number): string {
  return `${weekKey}|weekly_run|tier${tier}|run${runIndex}`
}

export function createPracticeSeed(userId: string, mode: GameMode, timestamp: number): string {
  return `practice|${userId}|${mode}|${timestamp}`
}

export function createRng(seed: string): seedrandom.PRNG {
  return seedrandom(seed)
}

export function getDateKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

export function getWeekKey(date: Date = new Date()): string {
  const year = date.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7)
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`
}

export function getDailyResetTime(date: Date = new Date()): Date {
  const reset = new Date(date)
  reset.setUTCHours(0, 0, 0, 0)
  reset.setUTCDate(reset.getUTCDate() + 1)
  return reset
}

export function getWeeklyResetTime(date: Date = new Date()): Date {
  const reset = new Date(date)
  // Find next Monday at 00:00 UTC
  const daysUntilMonday = (8 - reset.getUTCDay()) % 7 || 7
  reset.setUTCDate(reset.getUTCDate() + daysUntilMonday)
  reset.setUTCHours(0, 0, 0, 0)
  return reset
}

export function shuffleArray<T>(array: T[], rng: seedrandom.PRNG): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function pickRandom<T>(array: T[], rng: seedrandom.PRNG): T {
  return array[Math.floor(rng() * array.length)]
}

export function pickRandomN<T>(array: T[], n: number, rng: seedrandom.PRNG): T[] {
  const shuffled = shuffleArray(array, rng)
  return shuffled.slice(0, n)
}
