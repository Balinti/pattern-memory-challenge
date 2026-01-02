// Pattern Rating (PR) - Elo-like rating system

export interface PRUpdate {
  before: number
  after: number
  delta: number
}

const K_FACTOR = 32
const DEFAULT_PR = 1000
const MIN_PR = 100

export function calculateExpectedScore(playerPR: number, tierRating: number): number {
  return 1.0 / (1.0 + Math.pow(10, (tierRating - playerPR) / 400))
}

export function getTierRating(tier: number): number {
  // Tier 1 = 950, Tier 5 = 1150
  return 900 + tier * 50
}

export function calculateActualScore(success: boolean, rawScore: number): number {
  if (success) {
    // Success: 0.5 to 1.0 based on score quality
    return 0.5 + Math.min(rawScore, 1000) / 2000
  } else {
    // Failure: 0 to 0.25 based on partial credit
    return Math.max(0, rawScore / 2000 - 0.25)
  }
}

export function calculatePRChange(
  currentPR: number,
  tier: number,
  success: boolean,
  rawScore: number
): PRUpdate {
  const tierRating = getTierRating(tier)
  const expected = calculateExpectedScore(currentPR, tierRating)
  const actual = calculateActualScore(success, rawScore)

  const delta = Math.round(K_FACTOR * (actual - expected))
  const newPR = Math.max(MIN_PR, currentPR + delta)

  return {
    before: currentPR,
    after: newPR,
    delta: newPR - currentPR,
  }
}

export function getPRFromRatings(
  ratings: Array<{ mode: string; pr: number }>
): number {
  if (ratings.length === 0) return DEFAULT_PR

  const total = ratings.reduce((sum, r) => sum + r.pr, 0)
  return Math.round(total / ratings.length)
}

export function formatPR(pr: number): string {
  return pr.toLocaleString()
}
