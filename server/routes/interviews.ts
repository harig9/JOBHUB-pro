import { Router, type Request, type Response, type NextFunction } from 'express';
import { db } from '../db.ts';

const router = Router();

// GET /api/interviews
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = db.getInterviews('usr_demo_01');
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

// GET /api/interviews/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = db.getInterviewById(req.params.id);
    if (!session) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: `Interview session '${req.params.id}' was not found`,
        path: req.originalUrl,
      });
    }
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// PUT /api/interviews/:id
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = db.updateInterview(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
