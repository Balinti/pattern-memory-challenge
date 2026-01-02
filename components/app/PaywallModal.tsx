'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Zap, BarChart3, Infinity } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { captureEvent } from '@/lib/analytics/posthog-client'
import { EVENTS } from '@/lib/analytics/events'

interface PaywallModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: 'weekly_limit' | 'stats_depth' | 'post_run'
}

export function PaywallModal({ open, onOpenChange, trigger }: PaywallModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'weekly' | 'annual' | null>(null)

  const handleCheckout = async (priceKey: 'weekly' | 'annual') => {
    setLoading(priceKey)
    captureEvent(EVENTS.CHECKOUT_STARTED, { plan: priceKey, trigger })

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_key: priceKey }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(null)
    }
  }

  const titles = {
    weekly_limit: 'Unlock Unlimited Weekly Runs',
    stats_depth: 'Unlock Full Stats & Analytics',
    post_run: 'Great Run! Go Further with League+',
  }

  const descriptions = {
    weekly_limit: "You've used your free weekly run. Subscribe to League+ for unlimited runs.",
    stats_depth: 'Get deeper insights with full historical data and performance analytics.',
    post_run: 'Unlock unlimited weekly runs and detailed performance tracking.',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="h-6 w-6 text-yellow-500" />
            {titles[trigger]}
          </DialogTitle>
          <DialogDescription>
            {descriptions[trigger]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">League+ includes:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Infinity className="h-4 w-4 text-primary" />
                Unlimited weekly league runs
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Full stats & performance analytics
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Speed-accuracy profiles
              </li>
            </ul>
          </div>

          <div className="grid gap-3 pt-2">
            <Button
              onClick={() => handleCheckout('weekly')}
              disabled={!!loading}
              className="w-full"
            >
              {loading === 'weekly' ? 'Loading...' : '$6.99/week - Start 7-day trial'}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCheckout('annual')}
              disabled={!!loading}
              className="w-full"
            >
              {loading === 'annual' ? 'Loading...' : '$39.99/year - Save 50%+'}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime. 7-day free trial on both plans.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
