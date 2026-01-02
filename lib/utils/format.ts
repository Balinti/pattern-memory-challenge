import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  return num.toLocaleString()
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatScore(score: number): string {
  return score.toLocaleString()
}

export function formatAccuracy(accuracy: number): string {
  return `${accuracy.toFixed(1)}%`
}

export function formatPR(pr: number): string {
  return pr.toLocaleString()
}

export function formatOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export function formatRank(rank: number): string {
  if (rank <= 3) {
    const medals = ['🥇', '🥈', '🥉']
    return medals[rank - 1]
  }
  return formatOrdinal(rank)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length - 3) + '...'
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatModeName(mode: string): string {
  switch (mode) {
    case 'flash_grid':
      return 'Flash Grid'
    case 'sequence_forge':
      return 'Sequence Forge'
    case 'rotation_run':
      return 'Rotation Run'
    case 'weekly_run':
      return 'Weekly Run'
    default:
      return mode.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }
}

export function getModeIcon(mode: string): string {
  switch (mode) {
    case 'flash_grid':
      return '⚡'
    case 'sequence_forge':
      return '🔗'
    case 'rotation_run':
      return '🔄'
    case 'weekly_run':
      return '🏆'
    default:
      return '🎮'
  }
}

export function getModeDescription(mode: string): string {
  switch (mode) {
    case 'flash_grid':
      return 'Memorize colored tiles in a grid'
    case 'sequence_forge':
      return 'Remember and repeat token sequences'
    case 'rotation_run':
      return 'Predict pattern transformations'
    case 'weekly_run':
      return 'Complete all three modes in sequence'
    default:
      return ''
  }
}
