// Analytics event names and types

export const EVENTS = {
  // Auth events
  SIGNUP: 'signup',
  LOGIN: 'login',
  LOGOUT: 'logout',

  // Game events
  DAILY_PACK_STARTED: 'daily_pack_started',
  MODE_STARTED: 'mode_started',
  MODE_COMPLETED: 'mode_completed',
  WEEKLY_RUN_STARTED: 'weekly_run_started',
  WEEKLY_RUN_COMPLETED: 'weekly_run_completed',
  PRACTICE_STARTED: 'practice_started',
  PRACTICE_COMPLETED: 'practice_completed',

  // Monetization events
  RUN_LIMIT_HIT: 'run_limit_hit',
  PAYWALL_VIEW: 'paywall_view',
  PAYWALL_DISMISSED: 'paywall_dismissed',
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  SUBSCRIBED: 'subscribed',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',

  // Social events
  SHARE_SCORECARD: 'share_scorecard',
  LEADERBOARD_VIEW: 'leaderboard_view',
  PROFILE_VIEW: 'profile_view',

  // Navigation events
  PAGE_VIEW: 'page_view',
  CTA_CLICK: 'cta_click',
} as const

export type EventName = (typeof EVENTS)[keyof typeof EVENTS]

// Event property types
export interface ModeCompletedProps {
  mode: string
  kind: 'daily' | 'weekly' | 'practice'
  tier: number
  score: number
  accuracy: number
  duration_ms: number
  success: boolean
}

export interface WeeklyRunCompletedProps {
  tier: number
  total_score: number
  avg_accuracy: number
  total_duration_ms: number
  all_success: boolean
}

export interface PaywallViewProps {
  trigger: 'weekly_limit' | 'stats_depth' | 'post_run'
  current_plan: string
}

export interface CheckoutStartedProps {
  plan: 'weekly' | 'annual'
  trigger: string
}
