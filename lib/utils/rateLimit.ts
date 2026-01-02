// Simple in-memory rate limiter for API routes
// In production, consider using Redis or a dedicated rate limiting service

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetIn: number
}

export function rateLimit(
  key: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 60 }
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    cleanupExpiredEntries(now)
  }

  // No existing entry or entry has expired
  if (!entry || now >= entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    }
  }

  // Entry exists and is still valid
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    }
  }

  // Increment count
  entry.count++
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  }
}

function cleanupExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

export function getRateLimitKey(request: Request, prefix: string = ''): string {
  // Try to get client IP from headers
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'

  return `${prefix}:${ip}`
}

export function createRateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      resetIn: Math.ceil(result.resetIn / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetIn / 1000).toString(),
        'Retry-After': Math.ceil(result.resetIn / 1000).toString(),
      },
    }
  )
}
