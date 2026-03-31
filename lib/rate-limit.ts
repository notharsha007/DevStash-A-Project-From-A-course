import { Ratelimit, type Duration } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

let _redis: Redis | null | undefined

function getRedis(): Redis | null {
  if (_redis === undefined) {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    _redis = url && token ? new Redis({ url, token }) : null
  }
  return _redis
}

function createLimiter(requests: number, window: Duration): Ratelimit | null {
  const redis = getRedis()
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
  })
}

// One limiter per endpoint — created once at module load
export const loginLimiter = createLimiter(5, "15 m")
export const registerLimiter = createLimiter(3, "1 h")
export const forgotPasswordLimiter = createLimiter(3, "1 h")
export const resetPasswordLimiter = createLimiter(5, "15 m")
export const resendVerificationLimiter = createLimiter(3, "15 m")

export function getIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return "127.0.0.1"
}

export async function checkRateLimit(
  limiter: Ratelimit | null,
  key: string
): Promise<{ limited: boolean; reset: number }> {
  if (!limiter) return { limited: false, reset: 0 }
  try {
    const { success, reset } = await limiter.limit(key)
    return { limited: !success, reset }
  } catch {
    // Fail open if Upstash is unavailable
    return { limited: false, reset: 0 }
  }
}

export function rateLimitResponse(reset: number): NextResponse {
  const retryAfterSecs = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
  const minutes = Math.ceil(retryAfterSecs / 60)
  return NextResponse.json(
    {
      error: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSecs) },
    }
  )
}
