import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { 
  login, 
  register,
  verifyEmail,
  verifyOtp,
  resendVerification,
  resendOtp,
  getProfile, 
  googleLoginPlaceholder, 
  microsoftLoginPlaceholder,
  forgotPassword,
  verifyResetCode,
  resetPassword
} from '../controllers/authController';
import {
  getStudentNotices,
  getAdminNotices,
  getKioskNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  submitNotice,
  approveNotice,
  rejectNotice,
  publishNotice,
  acknowledgeNotice,
  bookmarkNotice,
  searchNotices,
  postQuestion,
  postAnswer,
  getQueriesForAdmin
} from '../controllers/noticeController';
import {
  handleGenerateNotice,
  handleRecommendTarget,
  handleContentCheck,
  handleGenerateSummary,
  handleTranslateNotice,
  handleAskNoticeAI
} from '../controllers/aiController';
import {
  getAnalytics,
  getAuditLogs
} from '../controllers/analyticsController';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'diginotice_secret_jwt_key_12345';

// Auth Middleware
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// Role Check Middleware
export const requireRoles = (roles: ('SUPER_ADMIN' | 'DEPARTMENT_ADMIN' | 'STUDENT')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient privileges' });
    }
    return next();
  };
};

import { authLimiter, aiLimiter } from '../middleware/securityFirewall';

// --- AUTHENTICATION ROUTES (Protected with Auth Rate Limiter Firewall) ---
router.post('/auth/login', authLimiter, login);
router.post('/auth/register', authLimiter, register);
router.get('/auth/verify-email', verifyEmail);
router.post('/auth/verify-otp', authLimiter, verifyOtp);
router.post('/auth/resend-verification', authLimiter, resendVerification);
router.post('/auth/resend-otp', authLimiter, resendOtp);
router.post('/auth/forgot-password', authLimiter, forgotPassword);
router.post('/auth/verify-reset-code', authLimiter, verifyResetCode);
router.post('/auth/reset-password', authLimiter, resetPassword);
router.get('/auth/profile', authMiddleware, getProfile);
router.post('/auth/google', googleLoginPlaceholder);
router.post('/auth/microsoft', microsoftLoginPlaceholder);

// --- NOTICE ROUTES ---
router.get('/notices', authMiddleware, getStudentNotices);
router.get('/notices/admin', authMiddleware, requireRoles(['SUPER_ADMIN', 'DEPARTMENT_ADMIN']), getAdminNotices);
router.get('/notices/kiosk', getKioskNotices); // Public access
router.get('/notices/search', authMiddleware, searchNotices);
router.get('/notices/:id', authMiddleware, getNoticeById);
router.post('/notices', authMiddleware, requireRoles(['SUPER_ADMIN', 'DEPARTMENT_ADMIN']), createNotice);
router.put('/notices/:id', authMiddleware, requireRoles(['SUPER_ADMIN', 'DEPARTMENT_ADMIN']), updateNotice);
router.delete('/notices/:id', authMiddleware, requireRoles(['SUPER_ADMIN', 'DEPARTMENT_ADMIN']), deleteNotice);

// Notice Workflow Routes
router.post('/notices/:id/submit', authMiddleware, requireRoles(['DEPARTMENT_ADMIN']), submitNotice);
router.post('/notices/:id/approve', authMiddleware, requireRoles(['SUPER_ADMIN']), approveNotice);
router.post('/notices/:id/reject', authMiddleware, requireRoles(['SUPER_ADMIN']), rejectNotice);
router.post('/notices/:id/publish', authMiddleware, requireRoles(['SUPER_ADMIN']), publishNotice);

// Notice Interactivity Routes
router.post('/notices/:id/acknowledge', authMiddleware, requireRoles(['STUDENT']), acknowledgeNotice);
router.post('/notices/:id/bookmark', authMiddleware, requireRoles(['STUDENT']), bookmarkNotice);
router.post('/notices/:noticeId/query', authMiddleware, requireRoles(['STUDENT']), postQuestion);
router.get('/queries', authMiddleware, requireRoles(['SUPER_ADMIN', 'DEPARTMENT_ADMIN']), getQueriesForAdmin);
router.post('/queries/:queryId/answer', authMiddleware, requireRoles(['SUPER_ADMIN', 'DEPARTMENT_ADMIN']), postAnswer);

// --- AI SERVICE ROUTES (Protected with AI Rate Limiter & Role Firewalls) ---
router.post('/ai/generate-notice', aiLimiter, authMiddleware, requireRoles(['SUPER_ADMIN', 'DEPARTMENT_ADMIN']), handleGenerateNotice);
router.post('/ai/target', aiLimiter, authMiddleware, requireRoles(['SUPER_ADMIN', 'DEPARTMENT_ADMIN']), handleRecommendTarget);
router.post('/ai/content-check', aiLimiter, authMiddleware, requireRoles(['SUPER_ADMIN', 'DEPARTMENT_ADMIN']), handleContentCheck);
router.post('/ai/summarize', aiLimiter, authMiddleware, handleGenerateSummary);
router.post('/ai/translate', aiLimiter, authMiddleware, handleTranslateNotice);
router.post('/ai/ask', aiLimiter, authMiddleware, handleAskNoticeAI);

// --- ANALYTICS & LOGGING ROUTES ---
router.get('/analytics', authMiddleware, requireRoles(['SUPER_ADMIN', 'DEPARTMENT_ADMIN']), getAnalytics);
router.get('/audit-logs', authMiddleware, requireRoles(['SUPER_ADMIN']), getAuditLogs);

export default router;
