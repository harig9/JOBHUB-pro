import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/resumes
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const resumes = db.getResumes('usr_demo_01');
    res.json(resumes);
  } catch (err) {
    next(err);
  }
});

// GET /api/resumes/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const resume = db.getResumeById(req.params.id);
    if (!resume) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: `Resume '${req.params.id}' was not found`,
        path: req.originalUrl,
      });
    }
    res.json(resume);
  } catch (err) {
    next(err);
  }
});

// POST /api/resumes
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, personalInfo, summary, experiences, educations, skills, projects, certifications, targetRoles, templateId, isPrimary } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'Resume title is required',
        path: req.originalUrl,
      });
    }

    const newResume = db.createResume({
      userId: 'usr_demo_01',
      title: title.trim(),
      isPrimary: isPrimary || false,
      templateId: templateId || 'modern-clean',
      targetRoles: targetRoles || ['Software Engineer'],
      personalInfo: personalInfo || {
        fullName: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        phone: '+1 (555) 438-9201',
        location: 'San Francisco, CA',
      },
      summary: summary || '',
      experiences: experiences || [],
      educations: educations || [],
      skills: skills || [],
      projects: projects || [],
      certifications: certifications || [],
    });

    res.status(201).json(newResume);
  } catch (err) {
    next(err);
  }
});

// PUT /api/resumes/:id
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = db.updateResume(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// POST /api/resumes/:id/duplicate
router.post('/:id/duplicate', (req: Request, res: Response, next: NextFunction) => {
  try {
    const duplicate = db.duplicateResume(req.params.id);
    res.status(201).json(duplicate);
  } catch (err) {
    next(err);
  }
});

// POST /api/resumes/:id/set-primary
router.post('/:id/set-primary', (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = db.updateResume(req.params.id, { isPrimary: true });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/resumes/:id
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = db.deleteResume(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: `Resume '${req.params.id}' not found`,
        path: req.originalUrl,
      });
    }
    res.json({ message: 'Resume deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;
