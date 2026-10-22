import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db.js';
import {
  analyzeATS,
  optimizeResumeATS,
  generateCoverLetter,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  parseRawResumeText,
  generateFollowUpEmail,
  generateInterviewCheatSheet,
  chatCareerAssistant,
} from '../gemini.js';

const router = Router();

// POST /api/ai/ats-scan
router.post('/ats-scan', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resumeId, jobDescription, jobId, jobTitle, company } = req.body;

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'jobDescription is required for ATS scan',
        path: req.originalUrl,
      });
    }

    let resume = resumeId ? db.getResumeById(resumeId) : undefined;
    if (!resume) {
      const allResumes = db.getResumes('usr_demo_01');
      resume = allResumes.find((r) => r.isPrimary) || allResumes[0];
    }

    if (!resume) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: 'No resume found for scanning',
        path: req.originalUrl,
      });
    }

    const scanResult = await analyzeATS(resume, jobDescription, jobTitle, company);
    if (jobId) {
      scanResult.jobId = jobId;
      // Also update job's matchScore
      db.updateJob(jobId, { matchScore: scanResult.overallScore });
    }

    db.saveATSScan(scanResult);
    res.json(scanResult);
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/optimize-resume (Target 85%+ ATS Score)
router.post('/optimize-resume', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resumeId, jobDescription, targetScore, saveAsNew } = req.body;

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'jobDescription is required to optimize resume',
        path: req.originalUrl,
      });
    }

    let resume = resumeId ? db.getResumeById(resumeId) : undefined;
    if (!resume) {
      const allResumes = db.getResumes('usr_demo_01');
      resume = allResumes.find((r) => r.isPrimary) || allResumes[0];
    }

    if (!resume) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: 'Resume to optimize not found',
        path: req.originalUrl,
      });
    }

    const result = await optimizeResumeATS(resume, jobDescription, targetScore || 88);

    let savedResume = result.optimizedResume;
    if (saveAsNew) {
      savedResume = db.createResume({
        userId: resume.userId,
        title: `${resume.title} (ATS 85%+ Optimized)`,
        isPrimary: false,
        templateId: resume.templateId,
        targetRoles: resume.targetRoles,
        personalInfo: result.optimizedResume.personalInfo,
        summary: result.optimizedResume.summary,
        experiences: result.optimizedResume.experiences,
        educations: result.optimizedResume.educations,
        skills: result.optimizedResume.skills,
        projects: result.optimizedResume.projects,
        certifications: result.optimizedResume.certifications,
      });
    } else {
      savedResume = db.updateResume(resume.id, result.optimizedResume);
    }

    res.json({
      success: true,
      optimizedResume: savedResume,
      newScore: result.newScore,
      changesSummary: result.changesSummary,
      keywordImprovements: result.keywordImprovements,
      message: `Resume successfully optimized to estimated ${result.newScore}% ATS match!`,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/cover-letter
router.post('/cover-letter', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resumeId, jobId, tone, length, instructions } = req.body;

    let resume = resumeId ? db.getResumeById(resumeId) : undefined;
    if (!resume) {
      const allResumes = db.getResumes('usr_demo_01');
      resume = allResumes.find((r) => r.isPrimary) || allResumes[0];
    }

    let job = jobId ? db.getJobById(jobId) : undefined;
    if (!job) {
      job = {
        id: 'job_custom',
        userId: 'usr_demo_01',
        title: req.body.jobTitle || 'Senior Software Engineer',
        company: req.body.company || 'Innovative Tech Corp',
        location: req.body.location || 'Remote',
        employmentType: 'Full-time',
        status: 'applied',
        jobDescription: req.body.jobDescription || 'Building scalable web applications, distributed APIs, and reliable backend systems.',
        keySkills: ['TypeScript', 'React', 'Java', 'SQL'],
        priority: 'high',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    if (!resume) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: 'No resume profile available to generate cover letter',
        path: req.originalUrl,
      });
    }

    const content = await generateCoverLetter(resume, job, tone || 'professional', length || 'standard', instructions);

    const saved = db.createCoverLetter({
      userId: 'usr_demo_01',
      jobId: job.id,
      resumeId: resume.id,
      title: `${job.company} — ${job.title} Cover Letter`,
      recipientName: req.body.recipientName || 'Hiring Team',
      recipientTitle: req.body.recipientTitle || 'Technical Recruiting',
      companyName: job.company,
      jobTitle: job.title,
      content,
      tone: tone || 'professional',
    });

    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/interview-prep
router.post('/interview-prep', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobTitle, company, jobDescription, count, jobId } = req.body;

    if (!jobTitle || !company) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'jobTitle and company are required',
        path: req.originalUrl,
      });
    }

    const questions = await generateInterviewQuestions(
      jobTitle,
      company,
      jobDescription || `Standard senior engineering role at ${company}`,
      count || 4
    );

    const session = db.createInterview({
      userId: 'usr_demo_01',
      jobId,
      jobTitle,
      company,
      experienceLevel: 'Senior / Staff',
      questions,
      status: 'draft',
    });

    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/evaluate-answer
router.post('/evaluate-answer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, questionId, userAnswer } = req.body;

    if (!userAnswer || !userAnswer.trim()) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'userAnswer is required',
        path: req.originalUrl,
      });
    }

    const session = db.getInterviewById(sessionId);
    if (!session) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: `Interview session '${sessionId}' was not found`,
        path: req.originalUrl,
      });
    }

    const question = session.questions.find((q) => q.id === questionId);
    if (!question) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: `Question '${questionId}' was not found in session`,
        path: req.originalUrl,
      });
    }

    const evaluation = await evaluateInterviewAnswer(question, userAnswer);

    question.userAnswer = userAnswer;
    question.evaluation = evaluation;

    // Recalculate session score
    const evaluatedQuestions = session.questions.filter((q) => q.evaluation);
    const avgScore = evaluatedQuestions.reduce((sum, q) => sum + (q.evaluation?.score || 0), 0) / (evaluatedQuestions.length || 1);
    session.overallScore = Number(avgScore.toFixed(1));
    session.status = evaluatedQuestions.length === session.questions.length ? 'completed' : 'in-progress';

    db.updateInterview(sessionId, session);

    res.json({
      questionId,
      userAnswer,
      evaluation,
      sessionOverallScore: session.overallScore,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/parse-resume
router.post('/parse-resume', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rawText } = req.body;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'rawText is required for parsing',
        path: req.originalUrl,
      });
    }

    const parsed = await parseRawResumeText(rawText);
    res.json(parsed);
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/follow-up-email
router.post('/follow-up-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId, type, notes } = req.body;

    const job = jobId ? db.getJobById(jobId) : db.getJobs('usr_demo_01')[0];
    if (!job) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: 'Target job opportunity not found',
        path: req.originalUrl,
      });
    }

    const resumes = db.getResumes('usr_demo_01');
    const primaryResume = resumes.find((r) => r.isPrimary) || resumes[0];

    const email = await generateFollowUpEmail(job, primaryResume, type || 'post_interview_thank_you', notes);
    res.json(email);
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/interview-cheat-sheet
router.post('/interview-cheat-sheet', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.body;

    const job = jobId ? db.getJobById(jobId) : db.getJobs('usr_demo_01')[0];
    if (!job) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: 'Target job opportunity not found',
        path: req.originalUrl,
      });
    }

    const resumes = db.getResumes('usr_demo_01');
    const primaryResume = resumes.find((r) => r.isPrimary) || resumes[0];

    const cheatSheet = await generateInterviewCheatSheet(job, primaryResume);
    res.json(cheatSheet);
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/chat
router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages, context } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'messages array is required',
        path: req.originalUrl,
      });
    }

    const jobs = db.getJobs('usr_demo_01');
    const upcomingInterviews = jobs
      .filter((j) => j.interviewDate)
      .map((j) => `${j.company} (${j.interviewRound || 'Interview'} on ${j.interviewDate})`);

    const upcomingDeadlines = jobs
      .filter((j) => j.deadline)
      .map((j) => `${j.company} (Deadline on ${j.deadline})`);

    const reply = await chatCareerAssistant(messages, {
      activeJobsCount: jobs.length,
      upcomingInterviews,
      upcomingDeadlines,
      topSkills: context?.topSkills || ['React', 'TypeScript', 'Java', 'Spring Boot', 'MySQL', 'PostgreSQL'],
    });

    res.json({ reply, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

export default router;
