import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { PLANS, formatPrice, calculateSavings } from '@/lib/stripe/plans'

export default function PricingPage() {
  const hasSubscriptions = !!(process.env.STRIPE_PRICE_WEEKLY_ID && process.env.STRIPE_PRICE_ANNUAL_ID)
  const displayPlans = hasSubscriptions ? PLANS : PLANS.filter(p => p.key === 'free')

  const weeklyPlan = PLANS.find(p => p.key === 'weekly')!
  const annualPlan = PLANS.find(p => p.key === 'annual')!
  const savings = calculateSavings(weeklyPlan, annualPlan)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl">🧠</span>
            Pattern League
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start with daily challenges for free. Upgrade to League+ for unlimited weekly runs
            and full analytics.
          </p>
        </div>

        <div className={`grid gap-8 max-w-5xl mx-auto ${displayPlans.length === 1 ? 'max-w-md' : displayPlans.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          {displayPlans.map((plan) => (
            <Card
              key={plan.key}
              className={plan.popular ? 'border-primary shadow-lg relative' : ''}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{formatPrice(plan)}</span>
                  {plan.key === 'annual' && (
                    <Badge variant="secondary" className="ml-2">
                      Save {savings}%
                    </Badge>
                  )}
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/login" className="w-full">
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.key === 'free' ? 'Get Started' : 'Start 7-Day Trial'}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <section className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">What do I get for free?</h3>
              <p className="text-muted-foreground">
                Free users get access to daily 3-pack challenges, 1 weekly league run per week,
                7-day stats history, and global leaderboards. No credit card required.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What's included in League+?</h3>
              <p className="text-muted-foreground">
                League+ unlocks unlimited weekly runs, full stats and performance analytics,
                speed-accuracy profiles, and complete historical data.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">How does the 7-day trial work?</h3>
              <p className="text-muted-foreground">
                Start your trial with no payment required for 7 days. You'll get full access to
                all League+ features. Cancel anytime before the trial ends to avoid charges.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes! You can cancel your subscription at any time from your account settings.
                You'll continue to have access until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What's the difference between weekly and annual billing?</h3>
              <p className="text-muted-foreground">
                Both plans include the same features. Annual billing saves you over 50%
                compared to weekly billing. Both start with a 7-day free trial.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container">
          <p className="text-center text-xs text-muted-foreground">
            In-game skill metrics are for entertainment purposes only.
            Not intended as medical or cognitive health assessments.
          </p>
        </div>
      </footer>
    </div>
  )
}
