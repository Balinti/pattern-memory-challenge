import { PostHog } from 'posthog-node'

let posthogClient: PostHog | null = null

function getPostHogClient(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return null
  }

  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      flushAt: 1,
      flushInterval: 0,
    })
  }

  return posthogClient
}

export function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  const client = getPostHogClient()
  if (client) {
    client.capture({
      distinctId,
      event,
      properties,
    })
  }
}

export function identifyServerUser(
  distinctId: string,
  properties?: Record<string, unknown>
) {
  const client = getPostHogClient()
  if (client) {
    client.identify({
      distinctId,
      properties,
    })
  }
}

export async function shutdownPostHog() {
  if (posthogClient) {
    await posthogClient.shutdown()
    posthogClient = null
  }
}
