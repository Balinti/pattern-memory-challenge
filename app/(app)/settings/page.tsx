'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { Crown, ExternalLink, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const checkout = searchParams.get('checkout')

  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [entitlement, setEntitlement] = useState<{
    plan: string
    status: string
    current_period_end: string | null
  } | null>(null)

  useEffect(() => {
    fetchEntitlement()
  }, [])

  const fetchEntitlement = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('entitlements')
      .select('plan, status, current_period_end')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setEntitlement(data)
    }
    setLoading(false)
  }

  const handleManageSubscription = async () => {
    setPortalLoading(true)

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No portal URL returned')
      }
    } catch (err) {
      console.error('Portal error:', err)
    } finally {
      setPortalLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isPaid = entitlement?.plan !== 'free' &&
    (entitlement?.status === 'active' || entitlement?.status === 'trialing')

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-4" />
        <div className="h-48 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and subscription
        </p>
      </div>

      {checkout === 'success' && (
        <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">
          Welcome to League+! Your subscription is now active.
        </div>
      )}

      {checkout === 'canceled' && (
        <div className="p-4 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg">
          Checkout was canceled. You can try again anytime.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Subscription
          </CardTitle>
          <CardDescription>
            Manage your League+ subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Plan</p>
              <p className="text-sm text-muted-foreground">
                {isPaid ? 'League+' : 'Free'}
              </p>
            </div>
            <Badge variant={isPaid ? 'default' : 'secondary'}>
              {entitlement?.status || 'inactive'}
            </Badge>
          </div>

          {entitlement?.current_period_end && isPaid && (
            <div>
              <p className="text-sm text-muted-foreground">
                {entitlement.status === 'trialing' ? 'Trial ends' : 'Renews'}:{' '}
                {new Date(entitlement.current_period_end).toLocaleDateString()}
              </p>
            </div>
          )}

          <Separator />

          {isPaid ? (
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="w-full"
            >
              {portalLoading ? 'Loading...' : 'Manage Subscription'}
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => router.push('/pricing')}
              className="w-full"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to League+
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
