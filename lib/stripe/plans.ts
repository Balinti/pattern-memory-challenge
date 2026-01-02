export interface Plan {
  key: 'free' | 'weekly' | 'annual'
  name: string
  description: string
  price: number
  interval: 'week' | 'year' | null
  features: string[]
  popular?: boolean
}

export const PLANS: Plan[] = [
  {
    key: 'free',
    name: 'Free',
    description: 'Get started with daily challenges',
    price: 0,
    interval: null,
    features: [
      'Daily 3-pack challenges',
      '1 weekly league run per week',
      'Basic stats (7-day history)',
      'Global leaderboards',
    ],
  },
  {
    key: 'weekly',
    name: 'League+',
    description: 'Unlimited runs, full stats',
    price: 6.99,
    interval: 'week',
    features: [
      'Everything in Free',
      'Unlimited weekly runs',
      'Full stats & analytics',
      'Speed-accuracy profiles',
      'Historical performance',
      '7-day free trial',
    ],
    popular: true,
  },
  {
    key: 'annual',
    name: 'League+ Annual',
    description: 'Best value - save over 50%',
    price: 39.99,
    interval: 'year',
    features: [
      'Everything in League+',
      'Save over 50% vs weekly',
      'Priority support',
      'Early access to new modes',
      '7-day free trial',
    ],
  },
]

export function getPlan(key: string): Plan | undefined {
  return PLANS.find(p => p.key === key)
}

export function formatPrice(plan: Plan): string {
  if (plan.price === 0) return 'Free'

  const formatted = `$${plan.price.toFixed(2)}`
  if (plan.interval === 'week') return `${formatted}/week`
  if (plan.interval === 'year') return `${formatted}/year`
  return formatted
}

export function calculateSavings(weeklyPlan: Plan, annualPlan: Plan): number {
  if (weeklyPlan.interval !== 'week' || annualPlan.interval !== 'year') return 0

  const yearlyAtWeeklyRate = weeklyPlan.price * 52
  const savings = ((yearlyAtWeeklyRate - annualPlan.price) / yearlyAtWeeklyRate) * 100

  return Math.round(savings)
}
