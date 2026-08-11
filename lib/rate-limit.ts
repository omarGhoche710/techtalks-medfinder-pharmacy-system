import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const isRateLimitEnabled = Boolean(redisUrl && redisToken);

const redis = isRateLimitEnabled
  ? new Redis({
      url: redisUrl!,
      token: redisToken!,
    })
  : null;

function createLimiter(
  limit: number,
  prefix: string,
): Ratelimit | null {
  if (!redis) return null;

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, "1 m"),
    prefix,
  });
}

// Different rate limit tiers (no-op when Redis env vars are unset)
export const rateLimiters = {
  search: createLimiter(30, "ratelimit:search"),
  inventory: createLimiter(20, "ratelimit:inventory"),
  transactions: createLimiter(10, "ratelimit:transactions"),
  general: createLimiter(60, "ratelimit:general"),
};

export async function checkRateLimit(
  request: NextRequest,
  limiter: Ratelimit | null,
): Promise<NextResponse | null> {
  if (!limiter) return null;

  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "anonymous";

  const { success, limit, reset } = await limiter.limit(ip);

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
      },
    );
  }

  return null;
}
