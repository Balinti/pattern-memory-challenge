import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  }
  return stripeInstance
}

export const stripe = {
  get checkout() { return getStripe().checkout },
  get subscriptions() { return getStripe().subscriptions },
  get billingPortal() { return getStripe().billingPortal },
  get customers() { return getStripe().customers },
  get webhooks() { return getStripe().webhooks },
}

export function hasStripePrices(): boolean {
  return !!(process.env.STRIPE_PRICE_WEEKLY_ID && process.env.STRIPE_PRICE_ANNUAL_ID)
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceKey: 'weekly' | 'annual',
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const priceId = priceKey === 'weekly'
    ? process.env.STRIPE_PRICE_WEEKLY_ID
    : process.env.STRIPE_PRICE_ANNUAL_ID

  if (!priceId) {
    throw new Error('Stripe price IDs not configured')
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 7,
      metadata: {
        user_id: userId,
        app_name: 'pattern-memory-challenge',
      },
    },
    metadata: {
      user_id: userId,
      app_name: 'pattern-memory-challenge',
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  })

  return session.url!
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session.url
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId)
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId)
}
