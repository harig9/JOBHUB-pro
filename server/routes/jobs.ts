import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db.js';
import { JobStatus } from '../types.js';

const router = Router();

// GET /api/jobs
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, search, priority, sort } = req.query;
    let jobs = db.getJobs('usr_demo_01');

    if (status && status !== 'all') {
      jobs = jobs.filter((j) => j.status === status);
    }

    if (priority && priority !== 'all') {
      jobs = jobs.filter((j) => j.priority === priority);
    }

    if (search) {
      const q = String(search).toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.keySkills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (sort === 'score_desc') {
      jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (sort === 'date_desc') {
      jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'company_asc') {
      jobs.sort((a, b) => a.company.localeCompare(b.company));
    }

    res.json(jobs);
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = db.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: `Job with ID '${req.params.id}' was not found`,
        path: req.originalUrl,
      });
    }

    const history = db.getJobHistory(job.id);
    res.json({ ...job, history });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      company,
      location,
      employmentType,
      jobDescription,
      salaryRange,
      status,
      priority,
      keySkills,
      notes,
      directUrl,
      contactPerson,
      contactEmail,
      deadline,
      interviewDate,
      interviewRound,
      followUpDate,
      offerDetails,
    } = req.body;

    // Bean validation simulation
    const validationErrors: Record<string, string> = {};
    if (!title || !title.trim()) validationErrors.title = 'Job title is mandatory';
    if (!company || !company.trim()) validationErrors.company = 'Company name is mandatory';
    if (!jobDescription || !jobDescription.trim()) validationErrors.jobDescription = 'Job description is required for ATS scoring and tailoring';

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'Validation failed for Job entity attributes',
        path: req.originalUrl,
        validationErrors,
      });
    }

    // Default key skills if none provided
    const parsedKeySkills = Array.isArray(keySkills)
      ? keySkills
      : typeof keySkills === 'string'
      ? keySkills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : ['Software Engineering', 'System Architecture'];

    const newJob = db.createJob({
      userId: 'usr_demo_01',
      title: title.trim(),
      company: company.trim(),
      location: location || 'Remote / Hybrid',
      employmentType: employmentType || 'Full-time',
      jobDescription: jobDescription.trim(),
      salaryRange: salaryRange || '',
      status: (status as JobStatus) || 'wishlist',
      priority: priority || 'medium',
      keySkills: parsedKeySkills,
      notes: notes || '',
      directUrl: directUrl || '',
      contactPerson: contactPerson || '',
      contactEmail: contactEmail || '',
      deadline: deadline || '',
      interviewDate: interviewDate || undefined,
      interviewRound: interviewRound || undefined,
      followUpDate: followUpDate || undefined,
      offerDetails: offerDetails || undefined,
      applicationDate: status === 'applied' || status === 'interviewing' || status === 'offer' ? new Date().toISOString() : undefined,
      matchScore: Math.floor(Math.random() * 12) + 82, // realistic initial benchmark
    });

    res.status(201).json(newJob);
  } catch (err) {
    next(err);
  }
});

// PUT /api/jobs/:id
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = db.updateJob(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/schedule - Set interview date or deadline
router.post('/:id/schedule', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { interviewDate, interviewRound, deadline, followUpDate, notes } = req.body;
    const existing = db.getJobById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: `Job ${req.params.id} not found` });
    }

    const updates: Partial<any> = {};
    if (interviewDate !== undefined) {
      updates.interviewDate = interviewDate;
      // Auto upgrade status to interviewing if currently wishlist or applied
      if (existing.status === 'wishlist' || existing.status === 'applied') {
        updates.status = 'interviewing';
      }
    }
    if (interviewRound !== undefined) updates.interviewRound = interviewRound;
    if (deadline !== undefined) updates.deadline = deadline;
    if (followUpDate !== undefined) updates.followUpDate = followUpDate;
    if (notes !== undefined) {
      updates.notes = existing.notes ? `${existing.notes}\n${notes}` : notes;
    }

    const updated = db.updateJob(req.params.id, updates);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/jobs/:id/status
router.patch('/:id/status', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, note } = req.body;
    if (!status) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'Field "status" is required for status transition',
        path: req.originalUrl,
      });
    }

    const updated = db.updateJob(req.params.id, {
      status,
      notes: note ? note : undefined,
      applicationDate: status === 'applied' && !db.getJobById(req.params.id)?.applicationDate ? new Date().toISOString() : undefined,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/jobs/:id
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = db.deleteJob(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: `Job '${req.params.id}' not found`,
        path: req.originalUrl,
      });
    }
    res.json({ message: 'Job deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;
