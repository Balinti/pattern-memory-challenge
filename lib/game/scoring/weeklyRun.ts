import { FlashGridResult } from './flashGrid'
import { SequenceForgeResult } from './sequenceForge'
import { RotationRunResult } from './rotationRun'

export interface WeeklyRunResult {
  score: number
  accuracy: number
  durationMs: number
  success: boolean
  details: {
    stages: Array<FlashGridResult | SequenceForgeResult | RotationRunResult>
    tier: number
    completedStages: number
    totalStages: number
  }
}

const COMPLETION_BONUS = 500
const ALL_SUCCESS_BONUS = 300

export function scoreWeeklyRun(
  stageResults: Array<FlashGridResult | SequenceForgeResult | RotationRunResult>,
  tier: number
): WeeklyRunResult {
  // Sum up all stage scores
  const totalScore = stageResults.reduce((sum, r) => sum + r.score, 0)
  const totalDuration = stageResults.reduce((sum, r) => sum + r.durationMs, 0)
  const totalAccuracy = stageResults.reduce((sum, r) => sum + r.accuracy, 0) / stageResults.length

  let score = totalScore

  // Completion bonus
  if (stageResults.length === 3) {
    score += COMPLETION_BONUS
  }

  // All success bonus
  const allSuccess = stageResults.every(r => r.success)
  if (allSuccess) {
    score += ALL_SUCCESS_BONUS
  }

  // Tier multiplier
  const tierMultiplier = 1 + (tier - 1) * 0.1
  score = Math.round(score * tierMultiplier)

  return {
    score,
    accuracy: Math.round(totalAccuracy * 100) / 100,
    durationMs: totalDuration,
    success: allSuccess && stageResults.length === 3,
    details: {
      stages: stageResults,
      tier,
      completedStages: stageResults.length,
      totalStages: 3,
    },
  }
}
