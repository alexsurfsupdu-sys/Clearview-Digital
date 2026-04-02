import { Redis } from "@upstash/redis";

let _redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ??
    process.env.KV_REST_API_URL?.trim() ??
    (process.env.REDIS_URL?.startsWith("http") ? process.env.REDIS_URL.trim() : undefined);
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ??
    process.env.KV_REST_API_TOKEN?.trim() ??
    process.env.REDIS_TOKEN?.trim();
  if (!url || !token) {
    _redis = null;
    return null;
  }
  try {
    _redis = new Redis({ url, token });
    return _redis;
  } catch {
    _redis = null;
    return null;
  }
}

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Fixed-window rate limit using Redis.
 * Falls open (allows) when Redis is unavailable — do not rely on this alone for hard limits.
 */
export async function rateLimit(
  key: string,
  limit = 10,
  windowSecs = 60,
): Promise<RateLimitResult> {
  const r = getRedis();
  const now = Date.now();
  const windowId = Math.floor(now / (windowSecs * 1000));
  const resetAt = (windowId + 1) * windowSecs * 1000;

  if (!r) {
    return { success: true, remaining: limit, resetAt };
  }

  const rlKey = `rl:${key}:${windowId}`;
  try {
    const count = await r.incr(rlKey);
    if (count === 1) {
      await r.expire(rlKey, windowSecs + 2);
    }
    const remaining = Math.max(0, limit - count);
    return { success: count <= limit, remaining, resetAt };
  } catch {
    return { success: true, remaining: limit, resetAt };
  }
}
