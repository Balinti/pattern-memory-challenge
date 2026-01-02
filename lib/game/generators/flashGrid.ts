import { createRng, pickRandomN } from '../seeds'
import { FlashGridParams, getFlashGridParams } from '../tiers'

export interface FlashGridChallenge {
  mode: 'flash_grid'
  params: FlashGridParams
  grid: number[][] // -1 for empty, 0-n for colors
  activeTiles: Array<{ row: number; col: number; color: number }>
}

const COLORS = [
  '#EF4444', // red
  '#3B82F6', // blue
  '#22C55E', // green
  '#EAB308', // yellow
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#F97316', // orange
  '#06B6D4', // cyan
]

export function getColorHex(colorIndex: number): string {
  return COLORS[colorIndex % COLORS.length]
}

export function generateFlashGridChallenge(seed: string, tier: number): FlashGridChallenge {
  const rng = createRng(seed)
  const params = getFlashGridParams(tier)

  // Create empty grid
  const grid: number[][] = Array(params.gridSize)
    .fill(null)
    .map(() => Array(params.gridSize).fill(-1))

  // Generate all possible positions
  const allPositions: Array<{ row: number; col: number }> = []
  for (let row = 0; row < params.gridSize; row++) {
    for (let col = 0; col < params.gridSize; col++) {
      allPositions.push({ row, col })
    }
  }

  // Pick random positions for active tiles
  const activePositions = pickRandomN(allPositions, params.tiles, rng)

  // Assign colors to active tiles
  const activeTiles = activePositions.map(pos => {
    const color = Math.floor(rng() * params.colors)
    grid[pos.row][pos.col] = color
    return { ...pos, color }
  })

  return {
    mode: 'flash_grid',
    params,
    grid,
    activeTiles,
  }
}

export function validateFlashGridAnswer(
  challenge: FlashGridChallenge,
  answers: number[][]
): { correct: number; total: number; accuracy: number } {
  const { gridSize } = challenge.params
  let correct = 0
  let total = challenge.activeTiles.length

  for (const tile of challenge.activeTiles) {
    if (answers[tile.row]?.[tile.col] === tile.color) {
      correct++
    }
  }

  // Also check for false positives
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const expected = challenge.grid[row][col]
      const answer = answers[row]?.[col] ?? -1

      if (expected === -1 && answer !== -1) {
        // False positive - marked something that shouldn't be
        total++
      }
    }
  }

  return {
    correct,
    total,
    accuracy: total > 0 ? (correct / total) * 100 : 0,
  }
}
