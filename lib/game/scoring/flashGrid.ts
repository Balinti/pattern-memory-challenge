import { FlashGridChallenge, validateFlashGridAnswer } from '../generators/flashGrid'

export interface FlashGridResult {
  score: number
  accuracy: number
  durationMs: number
  success: boolean
  details: {
    correct: number
    total: number
    tier: number
    gridSize: number
    tiles: number
  }
}

// Base score per correct tile, modified by accuracy and time
const BASE_SCORE_PER_TILE = 100
const PERFECT_BONUS = 200
const TIER_MULTIPLIER = 0.15 // 15% more per tier

export function scoreFlashGrid(
  challenge: FlashGridChallenge,
  answers: number[][],
  durationMs: number
): FlashGridResult {
  const validation = validateFlashGridAnswer(challenge, answers)
  const { correct, total, accuracy } = validation

  // Calculate base score
  let score = correct * BASE_SCORE_PER_TILE

  // Apply tier multiplier (tier 1 = 1x, tier 5 = 1.6x)
  const tierMultiplier = 1 + (challenge.params.tiles > 4 ? 1 : 0) * TIER_MULTIPLIER
  score = Math.round(score * tierMultiplier)

  // Time bonus: faster = more points (max 50% bonus for very fast)
  const expectedTime = challenge.params.exposureMs + (challenge.params.tiles * 500)
  const timeRatio = Math.min(expectedTime / Math.max(durationMs, 1000), 1.5)
  score = Math.round(score * (0.5 + timeRatio * 0.5))

  // Perfect accuracy bonus
  if (accuracy === 100) {
    score += PERFECT_BONUS
  }

  // Accuracy penalty for low accuracy
  if (accuracy < 50) {
    score = Math.round(score * (accuracy / 100))
  }

  const success = accuracy >= 70

  return {
    score: Math.max(0, score),
    accuracy: Math.round(accuracy * 100) / 100,
    durationMs,
    success,
    details: {
      correct,
      total,
      tier: Object.entries(require('../tiers').FLASH_GRID_TIERS)
        .find(([, params]) =>
          params.gridSize === challenge.params.gridSize &&
          params.tiles === challenge.params.tiles
        )?.[0] as unknown as number || 3,
      gridSize: challenge.params.gridSize,
      tiles: challenge.params.tiles,
    },
  }
}
