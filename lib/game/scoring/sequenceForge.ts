import { SequenceForgeChallenge, SequenceToken, validateSequenceForgeAnswer } from '../generators/sequenceForge'

export interface SequenceForgeResult {
  score: number
  accuracy: number
  durationMs: number
  success: boolean
  details: {
    correct: number
    total: number
    tier: number
    steps: number
    firstError: number | null
  }
}

const BASE_SCORE_PER_STEP = 120
const PERFECT_BONUS = 250
const STREAK_BONUS = 15 // Bonus per consecutive correct

export function scoreSequenceForge(
  challenge: SequenceForgeChallenge,
  answers: SequenceToken[],
  durationMs: number
): SequenceForgeResult {
  const validation = validateSequenceForgeAnswer(challenge, answers)
  const { correct, total, accuracy, firstError } = validation

  // Calculate base score with streak bonus
  let score = 0
  let streak = 0

  for (let i = 0; i < total; i++) {
    const expected = challenge.sequence[i]
    const answer = answers[i]

    if (answer && expected.shape === answer.shape && expected.color === answer.color) {
      streak++
      score += BASE_SCORE_PER_STEP + (streak * STREAK_BONUS)
    } else {
      streak = 0
    }
  }

  // Time bonus
  const expectedTime = challenge.params.showMs * challenge.params.steps + 3000
  const timeRatio = Math.min(expectedTime / Math.max(durationMs, 2000), 1.4)
  score = Math.round(score * (0.6 + timeRatio * 0.4))

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
  const tier = Math.min(5, Math.max(1, Math.ceil(challenge.params.steps / 2.5)))

  return {
    score: Math.max(0, score),
    accuracy: Math.round(accuracy * 100) / 100,
    durationMs,
    success,
    details: {
      correct,
      total,
      tier,
      steps: challenge.params.steps,
      firstError,
    },
  }
}
