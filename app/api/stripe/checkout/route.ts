import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, hasStripePrices } from '@/lib/stripe/stripe'
import { z } from 'zod'

const checkoutSchema = z.object({
  price_key: z.enum(['weekly', 'annual']),
})

export async function POST(request: NextRequest) {
  // Check if Stripe prices are configured
  if (!hasStripePrices()) {
    return NextResponse.json({ error: 'Subscriptions not available' }, { status: 503 })
  }

  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse and validate request body
  let body
  try {
    body = await request.json()
    body = checkoutSchema.parse(body)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { price_key } = body
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const url = await createCheckoutSession(
      user.id,
      user.email || '',
      price_key,
      `${appUrl}/settings?checkout=success`,
      `${appUrl}/settings?checkout=canceled`
    )

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
