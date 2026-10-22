import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/auth/me - Current user session
router.get('/me', (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = db.getUser('usr_demo_01');
    if (!user) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: 'Active user session not found',
        path: req.originalUrl,
      });
    }
    res.json({
      user,
      token: 'jwt_mock_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.jobhub_pro_session',
      authenticated: true,
      roles: ['ROLE_USER', 'ROLE_PRO_ARCHITECT'],
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = db.getUser('usr_demo_01');
    res.json({
      user: { ...user, email: email || user?.email },
      token: 'jwt_mock_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.jobhub_pro_session',
      authenticated: true,
      message: 'Authentication successful (Spring Security JWT standard)',
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/profile
router.put('/profile', (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = db.updateUser('usr_demo_01', req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
