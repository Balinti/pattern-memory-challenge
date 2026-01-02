// Sweet Spot Adaptive Difficulty (Practice Mode Only)
// Target success rate: 70-85%

export interface SweetSpotState {
  recentResults: boolean[] // Last 5 results
  currentTier: number
}

const TARGET_MIN = 70
const TARGET_MAX = 85
const WINDOW_SIZE = 5

export function createSweetSpotState(initialTier: number = 3): SweetSpotState {
  return {
    recentResults: [],
    currentTier: initialTier,
  }
}

export function updateSweetSpot(
  state: SweetSpotState,
  success: boolean
): SweetSpotState {
  // Add result to window
  const recentResults = [...state.recentResults, success].slice(-WINDOW_SIZE)

  // Calculate success rate
  const successCount = recentResults.filter(Boolean).length
  const successRate = (successCount / recentResults.length) * 100

  let newTier = state.currentTier

  // Only adjust after we have enough data
  if (recentResults.length >= 3) {
    if (successRate > TARGET_MAX && state.currentTier < 5) {
      // Too easy - increase difficulty
      newTier = state.currentTier + 1
    } else if (successRate < TARGET_MIN && state.currentTier > 1) {
      // Too hard - decrease difficulty
      newTier = state.currentTier - 1
    }
  }

  return {
    recentResults,
    currentTier: newTier,
  }
}

export function getSweetSpotRecommendation(state: SweetSpotState): {
  tier: number
  successRate: number
  trend: 'stable' | 'increasing' | 'decreasing'
} {
  const successCount = state.recentResults.filter(Boolean).length
  const successRate = state.recentResults.length > 0
    ? (successCount / state.recentResults.length) * 100
    : 75 // Default to middle of target range

  let trend: 'stable' | 'increasing' | 'decreasing' = 'stable'

  if (state.recentResults.length >= 3) {
    const recentHalf = state.recentResults.slice(-Math.floor(state.recentResults.length / 2))
    const recentRate = recentHalf.filter(Boolean).length / recentHalf.length

    const olderHalf = state.recentResults.slice(0, Math.floor(state.recentResults.length / 2))
    const olderRate = olderHalf.length > 0 ? olderHalf.filter(Boolean).length / olderHalf.length : 0.5

    if (recentRate > olderRate + 0.2) {
      trend = 'increasing'
    } else if (recentRate < olderRate - 0.2) {
      trend = 'decreasing'
    }
  }

  return {
    tier: state.currentTier,
    successRate,
    trend,
  }
}
