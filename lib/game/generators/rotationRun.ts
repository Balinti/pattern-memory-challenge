import { createRng, pickRandomN } from '../seeds'
import { RotationRunParams, getRotationRunParams } from '../tiers'

export interface RotationRunChallenge {
  mode: 'rotation_run'
  params: RotationRunParams
  originalGrid: boolean[][]
  transformedGrid: boolean[][]
  transform: string
}

export function generateRotationRunChallenge(seed: string, tier: number): RotationRunChallenge {
  const rng = createRng(seed)
  const params = getRotationRunParams(tier)

  // Create empty grid
  const originalGrid: boolean[][] = Array(params.gridSize)
    .fill(null)
    .map(() => Array(params.gridSize).fill(false))

  // Generate all possible positions
  const allPositions: Array<{ row: number; col: number }> = []
  for (let row = 0; row < params.gridSize; row++) {
    for (let col = 0; col < params.gridSize; col++) {
      allPositions.push({ row, col })
    }
  }

  // Pick random positions for filled cells
  const filledPositions = pickRandomN(allPositions, params.filled, rng)
  for (const pos of filledPositions) {
    originalGrid[pos.row][pos.col] = true
  }

  // Apply transformation
  const transformedGrid = applyTransform(originalGrid, params.transform)

  return {
    mode: 'rotation_run',
    params,
    originalGrid,
    transformedGrid,
    transform: params.transform,
  }
}

export function applyTransform(grid: boolean[][], transform: string): boolean[][] {
  const size = grid.length
  const result: boolean[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false))

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!grid[row][col]) continue

      let newRow: number, newCol: number

      switch (transform) {
        case 'rotate90':
          newRow = col
          newCol = size - 1 - row
          break
        case 'rotate180':
          newRow = size - 1 - row
          newCol = size - 1 - col
          break
        case 'rotate270':
          newRow = size - 1 - col
          newCol = row
          break
        case 'mirrorH':
          newRow = row
          newCol = size - 1 - col
          break
        case 'mirrorV':
          newRow = size - 1 - row
          newCol = col
          break
        default:
          newRow = row
          newCol = col
      }

      result[newRow][newCol] = true
    }
  }

  return result
}

export function getTransformLabel(transform: string): string {
  switch (transform) {
    case 'rotate90':
      return 'Rotate 90°'
    case 'rotate180':
      return 'Rotate 180°'
    case 'rotate270':
      return 'Rotate 270°'
    case 'mirrorH':
      return 'Mirror Horizontal'
    case 'mirrorV':
      return 'Mirror Vertical'
    default:
      return transform
  }
}

export function validateRotationRunAnswer(
  challenge: RotationRunChallenge,
  answer: boolean[][]
): { correct: number; total: number; accuracy: number } {
  const { transformedGrid } = challenge
  const size = transformedGrid.length
  let correct = 0
  let total = 0

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const expected = transformedGrid[row][col]
      const answered = answer[row]?.[col] ?? false

      if (expected || answered) {
        total++
        if (expected === answered) {
          correct++
        }
      }
    }
  }

  return {
    correct,
    total: Math.max(total, 1),
    accuracy: total > 0 ? (correct / total) * 100 : 0,
  }
}
