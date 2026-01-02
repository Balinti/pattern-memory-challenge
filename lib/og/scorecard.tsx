// This file contains the scorecard component used for OG image generation
// It can be imported by the API route for consistent styling

export interface ScorecardData {
  mode: string
  score: number
  accuracy: number
  durationMs: number
  success: boolean
  playerName: string
  playerAvatar?: string
  pr?: number
  leagueName?: string
}

export function generateScorecardUrl(attemptId: string, baseUrl: string): string {
  return `${baseUrl}/api/og/scorecard?attempt_id=${attemptId}`
}

export function generateShareUrl(attemptId: string, baseUrl: string): string {
  return `${baseUrl}/share/${attemptId}`
}

export function generateShareText(mode: string, score: number): string {
  return `I scored ${score.toLocaleString()} on Pattern League ${mode}! Can you beat me? 🧠`
}
