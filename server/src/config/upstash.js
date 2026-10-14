import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client if environment variables are provided and not running in test mode
export const redis =
  process.env.NODE_ENV === 'test' || !process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN
    ? null
    : new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

// Helper function to build slidingWindow limiters
const createLimiter = (requests, window, prefix) => {
  if (!redis || process.env.NODE_ENV === 'test') return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: `scheme_setu:${prefix}`,
  });
};

// 1. Strict Limiter (Brute-force protection for /login, /register, /request-password): 10 req / 15 mins
export const authStrictLimiter = createLimiter(10, '15 m', 'auth_strict');

// 2. Email Verification Limiter (/verify-email): 10 req / 15 mins
export const verifyLimiter = createLimiter(10, '15 m', 'verify');

// 3. Google OAuth Limiter (/google): 15 req / 15 mins
export const oauthLimiter = createLimiter(15, '15 m', 'oauth');

// 4. Session & Refresh Limiter (/refresh, /logout): 20 req / 5 mins
export const sessionLimiter = createLimiter(20, '5 m', 'session');

// 5. General API & Profile Limiter (/me, /update-me, /users): 60 req / 1 min
export const generalApiLimiter = createLimiter(60, '1 m', 'api_general');
