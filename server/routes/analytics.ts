import { Router, type Request, type Response, type NextFunction } from 'express';
import { db } from '../db.ts';

const router = Router();

// GET /api/analytics
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const analytics = db.getAnalytics('usr_demo_01');
    res.json(analytics);
  } catch (err) {
    next(err);
  }
});

export default router;
