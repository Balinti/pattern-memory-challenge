'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { identifyUser, captureEvent } from '@/lib/analytics/posthog-client'
import { EVENTS } from '@/lib/analytics/events'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()

      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Auth callback error:', error)
        router.push('/login?error=callback_failed')
        return
      }

      if (session?.user) {
        // Identify user in analytics
        identifyUser(session.user.id, {
          email: session.user.email,
        })

        // Track login event
        captureEvent(EVENTS.LOGIN, {
          provider: session.user.app_metadata?.provider || 'email',
        })

        // Redirect to intended destination
        router.push(redirect)
      } else {
        router.push('/login')
      }
    }

    handleCallback()
  }, [router, redirect])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">🧠</div>
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🧠</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
