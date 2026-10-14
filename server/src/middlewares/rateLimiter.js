export const rateLimit = (limiter, customKey = '') => async (req, res, next) => {
  // If running under test environment or Upstash Redis is not configured, bypass gracefully
  if (process.env.NODE_ENV === 'test' || !limiter) {
    return next();
  }

  try {
    // Identifier priority: logged in user ID -> IP address
    const identifier = req.user
      ? `user:${req.user._id}`
      : `ip:${req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'}`;

    const key = customKey ? `${customKey}:${identifier}` : identifier;

    const { success, limit, remaining, reset } = await limiter.limit(key);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', reset);

    if (!success) {
      const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
      const safeRetryAfter = retryAfterSeconds > 0 ? retryAfterSeconds : 1;

      res.setHeader('Retry-After', safeRetryAfter);

      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please slow down and try again later.',
        retryAfterSeconds: safeRetryAfter,
      });
    }

    next();
  } catch (error) {
    console.error('Rate limiting error:', error.message);
    // Graceful degradation: allow request if rate limiter fails
    next();
  }
};
