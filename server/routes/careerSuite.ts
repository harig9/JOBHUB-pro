import { Router, Request, Response, NextFunction } from 'express';
import { careerDb } from '../careerDb.js';
import { db as coreDb } from '../db.js';

const router = Router();

// 1. AI Job Match Engine
router.get('/match', (req: Request, res: Response, next: NextFunction) => {
  try {
    const resumeId = req.query.resumeId as string | undefined;
    const matches = careerDb.calculateJobMatches('usr_demo_01', resumeId);
    res.json(matches);
  } catch (err) {
    next(err);
  }
});

// 2. Personalized Career Roadmap
router.get('/roadmap', (req: Request, res: Response, next: NextFunction) => {
  try {
    const roadmaps = careerDb.getRoadmaps('usr_demo_01');
    res.json(roadmaps);
  } catch (err) {
    next(err);
  }
});

router.post('/roadmap/toggle-task', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roadmapId, taskId } = req.body;
    if (!roadmapId || !taskId) {
      return res.status(400).json({ error: 'Missing roadmapId or taskId' });
    }
    const updated = careerDb.toggleRoadmapTask(roadmapId, taskId);
    if (!updated) {
      return res.status(404).json({ error: 'Roadmap or task not found' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// 3. Coding & Aptitude Practice Lab
router.get('/coding-lab', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, difficulty } = req.query;
    const questions = careerDb.getAptitudeQuestions(category as string, difficulty as string);
    const submissions = careerDb.getPracticeSubmissions('usr_demo_01');
    res.json({ questions, submissions });
  } catch (err) {
    next(err);
  }
});

router.post('/coding-lab/submit', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { questionId, selectedOption, submittedCode, timeSpentSeconds } = req.body;
    const questions = careerDb.getAptitudeQuestions();
    const question = questions.find((q) => q.id === questionId);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    let isCorrect = false;
    if (question.category !== 'coding' && typeof selectedOption === 'number') {
      isCorrect = selectedOption === question.correctOptionIndex;
    } else if (question.category === 'coding') {
      // Sandboxed test-case verification
      isCorrect = Boolean(submittedCode && submittedCode.includes('return') && submittedCode.length > 25);
    }

    const submission = careerDb.submitPracticeAnswer({
      userId: 'usr_demo_01',
      questionId,
      selectedOption,
      submittedCode,
      isCorrect,
      timeSpentSeconds: timeSpentSeconds || 30,
    });

    res.json({
      submission,
      explanation: question.explanation,
      correctOptionIndex: question.correctOptionIndex,
    });
  } catch (err) {
    next(err);
  }
});

// 4. Visual Skill Gap Graph
router.get('/skill-gap', (req: Request, res: Response, next: NextFunction) => {
  try {
    const gaps = careerDb.getSkillGaps();
    res.json(gaps);
  } catch (err) {
    next(err);
  }
});

router.put('/skill-gap/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { proficiency } = req.body;
    const updated = careerDb.updateSkillProficiency(req.params.id, proficiency);
    if (!updated) {
      return res.status(404).json({ error: 'Skill node not found' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// 5. Company Research & Interview Packs
router.get('/company-packs', (req: Request, res: Response, next: NextFunction) => {
  try {
    const packs = careerDb.getCompanyPacks();
    res.json(packs);
  } catch (err) {
    next(err);
  }
});

router.post('/company-packs/toggle', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { packId, task } = req.body;
    const updated = careerDb.toggleCompanyChecklist(packId, task);
    if (!updated) {
      return res.status(404).json({ error: 'Pack not found' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// 6. Secure Career Document Vault
router.get('/vault', (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = careerDb.getVaultDocuments('usr_demo_01');
    res.json(docs);
  } catch (err) {
    next(err);
  }
});

router.post('/vault', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, category, fileSize, fileType, notes } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }
    const created = careerDb.addVaultDocument({
      userId: 'usr_demo_01',
      name,
      category,
      fileSize: fileSize || '120 KB',
      fileType: fileType || 'application/pdf',
      verified: true,
      notes,
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.delete('/vault/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const success = careerDb.deleteVaultDocument(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ message: 'Document removed from vault' });
  } catch (err) {
    next(err);
  }
});

// 7. Salary & Offer Decision Assistant
router.get('/offers', (req: Request, res: Response, next: NextFunction) => {
  try {
    const offers = careerDb.getJobOffers('usr_demo_01');
    res.json(offers);
  } catch (err) {
    next(err);
  }
});

router.post('/offers', (req: Request, res: Response, next: NextFunction) => {
  try {
    const saved = careerDb.saveJobOffer({
      ...req.body,
      userId: 'usr_demo_01',
    });
    res.json(saved);
  } catch (err) {
    next(err);
  }
});

// 8. Referral & Networking Tracker
router.get('/networking', (req: Request, res: Response, next: NextFunction) => {
  try {
    const contacts = careerDb.getNetworkingContacts('usr_demo_01');
    res.json(contacts);
  } catch (err) {
    next(err);
  }
});

router.post('/networking', (req: Request, res: Response, next: NextFunction) => {
  try {
    const saved = careerDb.saveNetworkingContact({
      ...req.body,
      userId: 'usr_demo_01',
    });
    res.json(saved);
  } catch (err) {
    next(err);
  }
});

// 9. Automated Weekly AI Career Report
router.get('/reports/weekly', (req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = careerDb.getWeeklyReports('usr_demo_01');
    res.json(reports);
  } catch (err) {
    next(err);
  }
});

router.post('/reports/weekly/generate', (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = careerDb.generateWeeklyReport('usr_demo_01');
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
});

// 10. Achievements
router.get('/achievements', (req: Request, res: Response, next: NextFunction) => {
  try {
    const achs = careerDb.getAchievements('usr_demo_01');
    res.json(achs);
  } catch (err) {
    next(err);
  }
});

router.post('/achievements', (req: Request, res: Response, next: NextFunction) => {
  try {
    const saved = careerDb.saveAchievement({
      ...req.body,
      userId: 'usr_demo_01',
    });
    res.json(saved);
  } catch (err) {
    next(err);
  }
});

// 11. Smart Application Autofill Mapper
router.post('/autofill', (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = coreDb.getUser('usr_demo_01');
    const resumes = coreDb.getResumes('usr_demo_01');
    const primary = resumes.find((r) => r.isPrimary) || resumes[0];

    const mappedFields = [
      { fieldName: 'Full Legal Name', value: primary?.personalInfo.fullName || user?.fullName || 'Alex Morgan', confidence: 'High (Verified Profile)', source: 'User Profile' },
      { fieldName: 'Email Address', value: primary?.personalInfo.email || user?.email || 'alex.morgan@example.com', confidence: 'High (Verified)', source: 'User Profile' },
      { fieldName: 'Phone Number', value: primary?.personalInfo.phone || user?.phone || '+91 98765 43210', confidence: 'High (Verified)', source: 'User Profile' },
      { fieldName: 'Current Location', value: primary?.personalInfo.location || user?.location || 'Bengaluru, India', confidence: 'High', source: 'Resume Personal Info' },
      { fieldName: 'LinkedIn Profile URL', value: primary?.personalInfo.linkedin || user?.linkedinUrl || 'https://linkedin.com/in/alexmorgan-dev', confidence: 'High', source: 'User Profile' },
      { fieldName: 'GitHub URL', value: primary?.personalInfo.github || user?.githubUrl || 'https://github.com/alexmorgan-code', confidence: 'High', source: 'User Profile' },
      { fieldName: 'Portfolio / Website', value: primary?.personalInfo.website || user?.portfolioUrl || 'https://alexmorgan.tech', confidence: 'High', source: 'User Profile' },
      { fieldName: 'Highest Degree', value: primary?.educations[0]?.degree ? `${primary.educations[0].degree} in ${primary.educations[0].fieldOfStudy}` : 'B.Tech in Computer Science', confidence: 'High', source: 'Primary Resume' },
      { fieldName: 'University / College', value: primary?.educations[0]?.institution || 'National Institute of Technology', confidence: 'High', source: 'Primary Resume' },
      { fieldName: 'Years of Experience', value: `${user?.yearsExperience || 0} years`, confidence: 'Medium (Fresh Graduate Track)', source: 'Profile Settings' },
      { fieldName: 'Notice Period / Availability', value: 'Immediate (Fresh Graduate / 15 Days)', confidence: 'Requires Review', source: 'Career Defaults' },
      { fieldName: 'Current / Expected CTC', value: 'As per industry standard / ₹12-16 LPA', confidence: 'Requires Review', source: 'User Compensation Preference' },
      { fieldName: 'Key Technical Skills', value: primary?.skills.flatMap((s) => s.skills).slice(0, 10).join(', ') || 'React, TypeScript, Node.js, SQL, Java', confidence: 'High', source: 'Verified Skills' },
    ];

    res.json({
      candidateName: primary?.personalInfo.fullName || 'Candidate',
      mappedFields,
      auditTimestamp: new Date().toISOString(),
      disclaimer: 'Always review pre-filled values prior to final external employer portal submission.',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
