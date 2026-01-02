export interface FlashGridParams {
  gridSize: number
  colors: number
  tiles: number
  exposureMs: number
}

export interface SequenceForgeParams {
  steps: number
  colors: number
  shapes: number
  showMs: number
}

export interface RotationRunParams {
  gridSize: number
  filled: number
  transform: 'rotate90' | 'rotate180' | 'rotate270' | 'mirrorH' | 'mirrorV'
  showMs: number
}

export interface WeeklyRunParams {
  stages: Array<{
    mode: 'flash_grid' | 'sequence_forge' | 'rotation_run'
    tier: number
    params: FlashGridParams | SequenceForgeParams | RotationRunParams
  }>
}

// Tier 1 is easiest, Tier 5 is hardest
export const FLASH_GRID_TIERS: Record<number, FlashGridParams> = {
  1: { gridSize: 3, colors: 3, tiles: 4, exposureMs: 1000 },
  2: { gridSize: 3, colors: 4, tiles: 5, exposureMs: 850 },
  3: { gridSize: 4, colors: 4, tiles: 7, exposureMs: 650 },
  4: { gridSize: 4, colors: 5, tiles: 9, exposureMs: 500 },
  5: { gridSize: 5, colors: 6, tiles: 12, exposureMs: 400 },
}

export const SEQUENCE_FORGE_TIERS: Record<number, SequenceForgeParams> = {
  1: { steps: 5, colors: 3, shapes: 3, showMs: 800 },
  2: { steps: 6, colors: 4, shapes: 4, showMs: 650 },
  3: { steps: 8, colors: 4, shapes: 4, showMs: 550 },
  4: { steps: 10, colors: 5, shapes: 5, showMs: 450 },
  5: { steps: 12, colors: 6, shapes: 6, showMs: 350 },
}

export const ROTATION_RUN_TIERS: Record<number, RotationRunParams> = {
  1: { gridSize: 3, filled: 3, transform: 'rotate90', showMs: 1200 },
  2: { gridSize: 3, filled: 4, transform: 'rotate90', showMs: 1000 },
  3: { gridSize: 3, filled: 5, transform: 'rotate90', showMs: 900 },
  4: { gridSize: 4, filled: 6, transform: 'rotate180', showMs: 800 },
  5: { gridSize: 4, filled: 8, transform: 'mirrorH', showMs: 700 },
}

export const TRANSFORMS = ['rotate90', 'rotate180', 'rotate270', 'mirrorH', 'mirrorV'] as const

export function getFlashGridParams(tier: number): FlashGridParams {
  return FLASH_GRID_TIERS[Math.min(Math.max(tier, 1), 5)]
}

export function getSequenceForgeParams(tier: number): SequenceForgeParams {
  return SEQUENCE_FORGE_TIERS[Math.min(Math.max(tier, 1), 5)]
}

export function getRotationRunParams(tier: number): RotationRunParams {
  return ROTATION_RUN_TIERS[Math.min(Math.max(tier, 1), 5)]
}

export function getTierForMode(mode: string, tier: number) {
  switch (mode) {
    case 'flash_grid':
      return getFlashGridParams(tier)
    case 'sequence_forge':
      return getSequenceForgeParams(tier)
    case 'rotation_run':
      return getRotationRunParams(tier)
    default:
      throw new Error(`Unknown mode: ${mode}`)
  }
}
