import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Create Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different rate limit tiers
export const rateLimiters = {

  // Search endpoint — 30 requests per minute
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    prefix: "ratelimit:search",
  }),

  // Inventory write operations — 20 requests per minute
  inventory: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    prefix: "ratelimit:inventory",
  }),

  // Transactions — 10 requests per minute
  transactions: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    prefix: "ratelimit:transactions",
  }),

  // General API — 60 requests per minute
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    prefix: "ratelimit:general",
  }),

};

// ============================================
// RATE LIMIT MIDDLEWARE HELPER
// ============================================

export async function checkRateLimit(
  request: NextRequest,
  limiter: Ratelimit,
): Promise<NextResponse | null> {

  // Use IP address as identifier
  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "anonymous";

  const { success, limit, remaining, reset } =
    await limiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      {
        error: "Too many requests — please slow down and try again later.",
        limit,
        remaining: 0,
        resetAt: new Date(reset).toISOString(),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  return null;
}