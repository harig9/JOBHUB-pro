import { Router, type Request, type Response, type NextFunction } from 'express';
import { db } from '../db.ts';

const router = Router();

// GET /api/cover-letters
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const letters = db.getCoverLetters('usr_demo_01');
    res.json(letters);
  } catch (err) {
    next(err);
  }
});

// GET /api/cover-letters/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const letter = db.getCoverLetterById(req.params.id);
    if (!letter) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: `Cover letter '${req.params.id}' was not found`,
        path: req.originalUrl,
      });
    }
    res.json(letter);
  } catch (err) {
    next(err);
  }
});

// POST /api/cover-letters
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, companyName, jobTitle, content, tone, jobId, resumeId, recipientName } = req.body;
    if (!content || !companyName) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'companyName and content are required',
        path: req.originalUrl,
      });
    }

    const created = db.createCoverLetter({
      userId: 'usr_demo_01',
      title: title || `${companyName} Cover Letter`,
      companyName,
      jobTitle: jobTitle || 'Target Role',
      content,
      tone: tone || 'professional',
      jobId,
      resumeId,
      recipientName,
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /api/cover-letters/:id
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = db.updateCoverLetter(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cover-letters/:id
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = db.deleteCoverLetter(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: `Cover letter '${req.params.id}' not found`,
        path: req.originalUrl,
      });
    }
    res.json({ message: 'Cover letter deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;
