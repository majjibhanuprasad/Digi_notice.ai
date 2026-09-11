import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// 1. Helmet HTTP Security Headers Firewall
export const helmetSecurity = helmet({
  contentSecurityPolicy: false, // Disabled for pure API / customized for dev/kiosk
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows images/avatars to load across origins
  frameguard: { action: 'sameorigin' },
  hidePoweredBy: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// 2. CORS Firewall with Dynamic Origin Validation
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

export const corsFirewall = cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow server-to-server, curl, Postman, mobile apps without Origin header
    if (!origin) {
      return callback(null, true);
    }

    // Exact matches
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Localhost or LAN IP origins (e.g. 192.168.x.x, 10.x.x.x, 172.16-31.x.x) for kiosk & mobile campus testing
    const isLocalOrLan = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);
    if (isLocalOrLan) {
      return callback(null, true);
    }

    // Reject all unknown foreign origins
    return callback(new Error(`CORS Firewall Block: Origin '${origin}' is not permitted.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
});

// 3. Rate Limiting Firewalls
// Auth Rate Limiter: Max 15 attempts per 15 minutes to prevent brute-force attacks
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts from this IP address. Please try again in 15 minutes.'
  }
});

// AI Service Rate Limiter: Max 30 requests per minute to prevent AI resource depletion
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'AI request limit reached. Please wait a moment before sending more queries.'
  }
});

// General API Rate Limiter: Max 300 requests per 15 minutes for general endpoints
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests. Please try again later.'
  }
});

// 4. Request Payload & Prototype Pollution Sanitization Firewall
export const payloadSanitizer = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any): boolean => {
    if (!obj || typeof obj !== 'object') return true;

    if (Object.prototype.hasOwnProperty.call(obj, '__proto__')) {
      return false;
    }

    const propNames = Object.getOwnPropertyNames(obj);
    for (const key of propNames) {
      // Block prototype pollution attempts
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return false;
      }

      // Check string values for null byte injection
      if (typeof obj[key] === 'string' && obj[key].includes('\0')) {
        return false;
      }

      // Recursively inspect nested objects
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const safe = sanitizeObject(obj[key]);
        if (!safe) return false;
      }
    }
    return true;
  };

  if (req.body && !sanitizeObject(req.body)) {
    return res.status(400).json({ message: 'Firewall Block: Malformed or suspicious payload detected.' });
  }

  if (req.query && !sanitizeObject(req.query)) {
    return res.status(400).json({ message: 'Firewall Block: Malformed or suspicious query parameters detected.' });
  }

  next();
};
