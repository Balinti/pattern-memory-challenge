import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createBillingPortalSession } from '@/lib/stripe/stripe'

export async function POST() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's stripe customer ID
  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!entitlement?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const url = await createBillingPortalSession(
      entitlement.stripe_customer_id,
      `${appUrl}/app/settings`
    )

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
