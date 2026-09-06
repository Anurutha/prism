import rateLimit from 'express-rate-limit';

// General API abuse protection.
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down and try again.' },
});

// Tighter limit specifically on image generation, since it's the most
// expensive operation and the one most worth protecting from abuse.
export const generationLimiter = rateLimit({
  windowMs: (Number(process.env.GENERATION_RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  max: Number(process.env.GENERATION_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    message: 'Generation limit reached. Please wait a few minutes before generating more images.',
  },
});

// Stricter limit on auth endpoints to slow down credential stuffing/brute force.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});
