import { NextRequest, NextResponse } from "next/server";

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: NextRequest, customKey?: string): string {
  if (customKey) return customKey;

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : request.ip || "unknown";
  return `ratelimit:${ip}`;
}

function cleanupExpired() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanupExpired, 60000);

export function rateLimit(options: RateLimitOptions) {
  const { maxRequests, windowMs, keyGenerator, skipSuccessfulRequests, skipFailedRequests } = options;

  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = keyGenerator ? keyGenerator(request) : getClientKey(request);
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record || now > record.resetAt) {
      record = { count: 0, resetAt: now + windowMs };
      rateLimitStore.set(key, record);
    }

    record.count++;

    const remaining = Math.max(0, maxRequests - record.count);
    const resetIn = Math.ceil((record.resetAt - now) / 1000);

    const headers = {
      "X-RateLimit-Limit": maxRequests.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": resetIn.toString(),
    };

    if (record.count > maxRequests) {
      return NextResponse.json(
        {
          error: "Demasiadas solicitudes",
          code: "TOO_MANY_REQUESTS",
          retryAfter: resetIn,
        },
        { status: 429, headers }
      );
    }

    return null;
  };
}

export const authRateLimit = rateLimit({
  maxRequests: 10,
  windowMs: 60 * 1000,
  keyGenerator: (req) => `auth:${getClientKey(req)}`,
});

export const publicApiRateLimit = rateLimit({
  maxRequests: 100,
  windowMs: 60 * 1000,
  keyGenerator: (req) => `public:${getClientKey(req)}`,
});

export const authenticatedApiRateLimit = rateLimit({
  maxRequests: 500,
  windowMs: 60 * 1000,
  keyGenerator: (req) => {
    const auth = req.headers.get("authorization");
    const userId = auth ? auth.replace("Bearer ", "").substring(0, 20) : "anon";
    return `api:${userId}:${getClientKey(req)}`;
  },
});

export const strictRateLimit = rateLimit({
  maxRequests: 5,
  windowMs: 60 * 1000,
  keyGenerator: (req) => `strict:${getClientKey(req)}`,
});