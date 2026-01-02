import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'

export type StripeEventType =
  | 'checkout.session.completed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'

export async function handleStripeEvent(event: Stripe.Event) {
  const supabase = await createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      const userId = session.metadata?.user_id
      if (!userId) {
        console.error('No user_id in checkout session metadata')
        return
      }

      // Update entitlement with Stripe customer ID
      await supabase
        .from('entitlements')
        .update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        })
        .eq('user_id', userId)

      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription

      const customerId = subscription.customer as string
      const status = mapStripeStatus(subscription.status)
      const plan = getPlanFromPrice(subscription.items.data[0]?.price.id || '')

      // Find user by stripe customer ID
      const { data: entitlement } = await supabase
        .from('entitlements')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (!entitlement) {
        // Try finding by subscription ID from metadata
        const userId = subscription.metadata?.user_id
        if (userId) {
          await supabase
            .from('entitlements')
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              plan,
              status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              trial_ends_at: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
            })
            .eq('user_id', userId)
        }
        return
      }

      await supabase
        .from('entitlements')
        .update({
          stripe_subscription_id: subscription.id,
          plan,
          status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_ends_at: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
        })
        .eq('user_id', entitlement.user_id)

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      await supabase
        .from('entitlements')
        .update({
          plan: 'free',
          status: 'canceled',
          stripe_subscription_id: null,
        })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      await supabase
        .from('entitlements')
        .update({
          status: 'past_due',
        })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      // Only update if it was past_due
      await supabase
        .from('entitlements')
        .update({
          status: 'active',
        })
        .eq('stripe_customer_id', customerId)
        .eq('status', 'past_due')

      break
    }
  }
}

function mapStripeStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case 'active':
      return 'active'
    case 'trialing':
      return 'trialing'
    case 'past_due':
      return 'past_due'
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'canceled'
    default:
      return 'inactive'
  }
}

function getPlanFromPrice(priceId: string): string {
  if (priceId === process.env.STRIPE_PRICE_WEEKLY_ID) {
    return 'weekly'
  }
  if (priceId === process.env.STRIPE_PRICE_ANNUAL_ID) {
    return 'annual'
  }
  return 'free'
}
