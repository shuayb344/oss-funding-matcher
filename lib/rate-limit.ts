/**
 * Rate limiter supporting Upstash Redis (for distributed production serverless)
 * with automatic fallback to local in-memory store when Upstash credentials are missing.
 */

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const localStore = new Map<string, RateLimitEntry>();

// Clean up local store periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of localStore) {
      if (now > entry.resetAt) {
        localStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
}

let redisClient: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (err) {
    console.error("Failed to initialize Upstash Redis:", err);
  }
}

/**
 * Check rate limit for a given key.
 *
 * @param key - Unique identifier (e.g. userId + endpoint)
 * @param maxRequests - Max requests allowed in window
 * @param windowMs - Window duration in ms
 */
export async function checkRateLimitAsync(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): Promise<RateLimitResult> {
  if (redisClient) {
    try {
      const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
      const ratelimit = new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
        prefix: "oss_funding",
      });

      const res = await ratelimit.limit(key);
      return {
        allowed: res.success,
        remaining: res.remaining,
        resetIn: Math.ceil((res.reset - Date.now()) / 1000),
      };
    } catch (err) {
      console.warn("Upstash rate limit check failed, falling back to local memory store:", err);
    }
  }

  // Fallback to local memory store
  return checkRateLimitLocal(key, maxRequests, windowMs);
}

function checkRateLimitLocal(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = localStore.get(key);

  if (!entry || now > entry.resetAt) {
    localStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: Math.ceil(windowMs / 1000) };
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
 * Rate limit helper for Next.js API routes (synchronous or async).
 */
export function rateLimitOrContinue(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): { response: Response | null; result: RateLimitResult } {
  const result = checkRateLimitLocal(key, maxRequests, windowMs);

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

export async function rateLimitOrContinueAsync(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): Promise<{ response: Response | null; result: RateLimitResult }> {
  const result = await checkRateLimitAsync(key, maxRequests, windowMs);

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
