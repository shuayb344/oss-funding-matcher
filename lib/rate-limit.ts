/**
 * Simple in-memory rate limiter.
 *
 * For a Vercel deployment with multiple serverless instances, this won't
 * share state across instances. For production, use Upstash Redis or similar.
 * For this scale (10k users), in-memory is fine for preventing abuse.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
}

/**
 * Check rate limit for a given key.
 *
 * @param key - Unique identifier (e.g. userId + endpoint)
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs / 1000 };
  }

  if (entry.count >= maxRequests) {
    const resetIn = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, resetIn };
  }

  entry.count++;
  const resetIn = Math.ceil((entry.resetAt - now) / 1000);
  return { allowed: true, remaining: maxRequests - entry.count, resetIn };
}

/**
 * Rate limit middleware helper for Next.js API routes.
 * Returns a NextResponse if rate limited, null otherwise.
 */
export function rateLimitOrContinue(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): { response: Response | null; result: RateLimitResult } {
  const result = checkRateLimit(key, maxRequests, windowMs);

  if (!result.allowed) {
    const response = new Response(
      JSON.stringify({
        error: "Rate limit exceeded. Please try again later.",
        resetIn: result.resetIn,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(result.resetIn),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.resetIn),
        },
      }
    );
    return { response, result };
  }

  return { response: null, result };
}
