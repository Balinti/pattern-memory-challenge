import { RotationRunChallenge, validateRotationRunAnswer } from '../generators/rotationRun'

export interface RotationRunResult {
  score: number
  accuracy: number
  durationMs: number
  success: boolean
  details: {
    correct: number
    total: number
    tier: number
    gridSize: number
    filled: number
    transform: string
  }
}

const BASE_SCORE = 800
const PERFECT_BONUS = 200
const TRANSFORM_BONUS: Record<string, number> = {
  rotate90: 0,
  rotate180: 25,
  rotate270: 50,
  mirrorH: 75,
  mirrorV: 75,
}

export function scoreRotationRun(
  challenge: RotationRunChallenge,
  answer: boolean[][],
  durationMs: number
): RotationRunResult {
  const validation = validateRotationRunAnswer(challenge, answer)
  const { correct, total, accuracy } = validation

  // Base score scaled by accuracy
  let score = Math.round(BASE_SCORE * (accuracy / 100))

  // Transform difficulty bonus
  score += TRANSFORM_BONUS[challenge.transform] || 0

  // Time bonus
  const expectedTime = challenge.params.showMs + 4000
  const timeRatio = Math.min(expectedTime / Math.max(durationMs, 2000), 1.3)
  score = Math.round(score * (0.7 + timeRatio * 0.3))

  // Perfect bonus
  if (accuracy === 100) {
    score += PERFECT_BONUS
  }

  // Accuracy penalty for low accuracy
  if (accuracy < 50) {
    score = Math.round(score * (accuracy / 100))
  }

  const success = accuracy >= 70

  // Determine tier from params
  const tier = Math.min(5, Math.max(1, Math.ceil(challenge.params.filled / 2)))

  return {
    score: Math.max(0, score),
    accuracy: Math.round(accuracy * 100) / 100,
    durationMs,
    success,
    details: {
      correct,
      total,
      tier,
      gridSize: challenge.params.gridSize,
      filled: challenge.params.filled,
      transform: challenge.transform,
    },
  }
}
