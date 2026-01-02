// League system based on Pattern Rating (PR)

export interface League {
  name: string
  minPR: number
  maxPR: number
  color: string
  bgClass: string
  textClass: string
  icon: string
}

export const LEAGUES: League[] = [
  {
    name: 'Bronze',
    minPR: 0,
    maxPR: 899,
    color: '#CD7F32',
    bgClass: 'bg-bronze/20',
    textClass: 'text-bronze',
    icon: '🥉',
  },
  {
    name: 'Silver',
    minPR: 900,
    maxPR: 1099,
    color: '#C0C0C0',
    bgClass: 'bg-silver/30',
    textClass: 'text-gray-500',
    icon: '🥈',
  },
  {
    name: 'Gold',
    minPR: 1100,
    maxPR: 1299,
    color: '#FFD700',
    bgClass: 'bg-gold/20',
    textClass: 'text-yellow-600',
    icon: '🥇',
  },
  {
    name: 'Platinum',
    minPR: 1300,
    maxPR: 1499,
    color: '#E5E4E2',
    bgClass: 'bg-platinum/30',
    textClass: 'text-gray-400',
    icon: '💎',
  },
  {
    name: 'Diamond',
    minPR: 1500,
    maxPR: 1799,
    color: '#B9F2FF',
    bgClass: 'bg-diamond/30',
    textClass: 'text-cyan-500',
    icon: '💠',
  },
  {
    name: 'Master',
    minPR: 1800,
    maxPR: Infinity,
    color: '#9B59B6',
    bgClass: 'bg-master/20',
    textClass: 'text-purple-500',
    icon: '👑',
  },
]

export function getLeague(pr: number): League {
  return LEAGUES.find(l => pr >= l.minPR && pr <= l.maxPR) || LEAGUES[0]
}

export function getNextLeague(pr: number): League | null {
  const currentLeague = getLeague(pr)
  const currentIndex = LEAGUES.indexOf(currentLeague)

  if (currentIndex < LEAGUES.length - 1) {
    return LEAGUES[currentIndex + 1]
  }

  return null
}

export function getProgressToNextLeague(pr: number): {
  current: League
  next: League | null
  progress: number
  prNeeded: number
} {
  const current = getLeague(pr)
  const next = getNextLeague(pr)

  if (!next) {
    return {
      current,
      next: null,
      progress: 100,
      prNeeded: 0,
    }
  }

  const rangeStart = current.minPR
  const rangeEnd = next.minPR
  const progress = ((pr - rangeStart) / (rangeEnd - rangeStart)) * 100

  return {
    current,
    next,
    progress: Math.min(100, Math.max(0, progress)),
    prNeeded: next.minPR - pr,
  }
}

export function formatLeagueDisplay(pr: number): string {
  const league = getLeague(pr)
  return `${league.icon} ${league.name}`
}
