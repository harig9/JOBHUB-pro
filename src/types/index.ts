export type JobStatus = 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'archived';

export interface User {
  id: string;
  email: string;
  fullName: string;
  headline: string;
  targetRole: string;
  yearsExperience: number;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  userId: string;
  title: string;
  company: string;
  location: string;
  employmentType: 'Full-time' | 'Contract' | 'Remote' | 'Hybrid' | 'Part-time';
  salaryRange?: string;
  status: JobStatus;
  applicationDate?: string;
  deadline?: string;
  interviewDate?: string;
  interviewRound?: string;
  followUpDate?: string;
  offerDetails?: {
    baseSalary?: string;
    equity?: string;
    bonus?: string;
    deadline?: string;
  };
  directUrl?: string;
  contactPerson?: string;
  contactEmail?: string;
  jobDescription: string;
  notes?: string;
  matchScore?: number;
  keySkills: string[];
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
  history?: JobStatusHistory[];
}

export interface JobStatusHistory {
  id: string;
  jobId: string;
  fromStatus: JobStatus;
  toStatus: JobStatus;
  note?: string;
  changedAt: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bulletPoints: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  metrics?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
}

export type ResumeTemplateId = 'modern-clean' | 'executive-serif' | 'tech-minimal' | 'compact-ats';

export interface Resume {
  id: string;
  userId: string;
  title: string;
  isPrimary: boolean;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  summary: string;
  experiences: WorkExperience[];
  educations: Education[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  certifications: Certification[];
  targetRoles: string[];
  templateId: ResumeTemplateId;
  createdAt: string;
  updatedAt: string;
}

export interface ATSScanResult {
  id: string;
  resumeId: string;
  jobId?: string;
  jobTitle?: string;
  company?: string;
  overallScore: number;
  matchRating: 'Excellent' | 'Strong' | 'Moderate' | 'Needs Work';
  breakdown: {
    hardSkillsScore: number;
    softSkillsScore: number;
    experienceRelevanceScore: number;
    formattingScore: number;
    quantifiableMetricsScore: number;
  };
  skillsAnalysis: {
    matchedHardSkills: string[];
    missingHardSkills: string[];
    matchedSoftSkills: string[];
    missingSoftSkills: string[];
  };
  actionableRecommendations: {
    priority: 'high' | 'medium' | 'low';
    section: 'Summary' | 'Experience' | 'Skills' | 'Formatting';
    suggestion: string;
    impact: string;
  }[];
  tailoredBulletSuggestions: {
    original: string;
    improved: string;
    targetKeywords: string[];
  }[];
  scannedAt: string;
}

export interface CoverLetter {
  id: string;
  userId: string;
  jobId?: string;
  resumeId?: string;
  title: string;
  recipientName?: string;
  recipientTitle?: string;
  companyName: string;
  jobTitle: string;
  content: string;
  tone: 'professional' | 'conversational' | 'executive' | 'direct';
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  id: string;
  category: 'technical' | 'behavioral' | 'situational' | 'culture' | 'company';
  question: string;
  contextWhyAsked: string;
  tips: string[];
  sampleStarAnswer?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  userAnswer?: string;
  evaluation?: {
    score: number;
    strengths: string[];
    improvements: string[];
    starFeedback: string;
    betterAnswerDraft: string;
  };
}

export interface InterviewSession {
  id: string;
  userId: string;
  jobId?: string;
  jobTitle: string;
  company: string;
  experienceLevel: string;
  questions: InterviewQuestion[];
  overallScore?: number;
  status: 'draft' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CareerAnalytics {
  totalApplications: number;
  statusCounts: Record<JobStatus, number>;
  interviewRate: number;
  offerRate: number;
  avgMatchScore: number;
  topSkillsInDemand: { skill: string; count: number; userHasSkill: boolean }[];
  applicationsTimeline: { date: string; count: number }[];
  pipelineFunnel: { stage: string; count: number; percentage: number }[];
}

export interface SystemInfo {
  appName: string;
  version: string;
  runtime: {
    platform: string;
    nodeVersion: string;
    port: number;
    protocol: string;
  };
  architectureAudit: {
    requestedBackend: string;
    activeBackend: string;
    status: string;
    infrastructureDisclosure: string;
    database: {
      engine: string;
      persistenceFile: string;
      relations: string[];
      integrity: string;
    };
    aiIntegration: {
      provider: string;
      sdk: string;
      model: string;
      apiKeyConfigured: boolean;
      fallbackSupport: string;
      features: string[];
    };
  };
  atsEngine: {
    targetMatchThreshold: number;
    scoringDimensions: string[];
    supportedExportFormats: string[];
  };
}

export type NotificationType = 'interview' | 'deadline' | 'offer_deadline' | 'follow_up' | 'custom_reminder';
export type NotificationUrgency = 'critical' | 'high' | 'medium' | 'low';

export interface CareerNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  jobId?: string;
  company?: string;
  jobTitle?: string;
  targetDate: string; // ISO string
  urgency: NotificationUrgency;
  isRead: boolean;
  interviewRound?: string;
  daysRemaining: number;
  hoursRemaining: number;
  formattedRemaining: string;
  snoozedUntil?: string;
  actionUrl?: string;
  contactPerson?: string;
  contactEmail?: string;
}

export interface CustomReminder {
  id: string;
  jobId?: string;
  company?: string;
  title: string;
  note?: string;
  targetDate: string;
  isCompleted: boolean;
  createdAt: string;
}

// 1. AI Job Match Result
export interface JobMatchResult {
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
  experienceRequired: string;
  salaryText?: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  requiredQualifications: string[];
  eligibilityGaps: string[];
  relevanceExplanation: string;
  calculationBreakdown: {
    skillsMatchPct: number;
    experienceMatchPct: number;
    educationMatchPct: number;
  };
  isVerifiedJob: boolean;
  statusInTracker?: JobStatus;
}

// 2. Personalized Career Roadmap
export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  category: 'learning' | 'project' | 'practice' | 'certification';
  durationHours: number;
  completed: boolean;
  dueDate?: string;
  resourceLink?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface RoadmapMilestone {
  id: string;
  weekNumber: number;
  title: string;
  goal: string;
  tasks: RoadmapTask[];
  completed: boolean;
}

export interface CareerRoadmap {
  id: string;
  userId: string;
  targetRole: string;
  currentSkills: string[];
  targetDate: string;
  weeklyHoursAvailability: number;
  estimatedWeeks: number;
  milestones: RoadmapMilestone[];
  overallProgress: number;
  assumptions: string[];
  createdAt: string;
  updatedAt: string;
}

// 3. Coding & Aptitude Practice Lab
export interface AptitudeQuestionItem {
  id: string;
  category: 'quantitative' | 'logical' | 'verbal' | 'sql' | 'coding';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  correctOptionIndex?: number;
  explanation: string;
  starterCode?: string;
  testCases?: { input: string; expectedOutput: string }[];
  companyTags?: string[];
}

export interface PracticeSubmission {
  id: string;
  userId: string;
  questionId: string;
  selectedOption?: number;
  submittedCode?: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  submittedAt: string;
}

// 4. Visual Skill Gap Graph
export interface SkillGapNode {
  id: string;
  skillName: string;
  category: 'Core CS' | 'Frontend' | 'Backend' | 'Database' | 'DevOps & Cloud' | 'Aptitude & Soft Skills';
  importance: 'Essential' | 'Preferred' | 'Bonus';
  userProficiency: 'None' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  status: 'verified' | 'in-progress' | 'gap';
  verifiedEvidenceCount: number;
  evidenceLabels: string[];
  recommendedRoadmapAction: string;
  relevanceRationale: string;
}

// 5. Company Research & Interview Packs
export interface CompanyResearchPack {
  id: string;
  companyName: string;
  industry: string;
  headquarters: string;
  indianOffices: string[];
  overview: string;
  hiringProcessRounds: {
    roundNumber: number;
    roundName: string;
    focusAreas: string[];
    tips: string;
  }[];
  likelyTechnicalQuestions: string[];
  likelyBehavioralQuestions: string[];
  questionsToAskInterviewer: string[];
  prepChecklist: { task: string; done: boolean }[];
  sourceReference: string;
  updatedAt: string;
}

// 6. Secure Career Document Vault
export interface CareerVaultDocument {
  id: string;
  userId: string;
  name: string;
  category: 'Resume' | 'Certificate' | 'Cover Letter' | 'Offer Letter' | 'Project Evidence' | 'Transcript';
  fileSize: string;
  fileType: string;
  uploadDate: string;
  downloadUrl?: string;
  verified: boolean;
  notes?: string;
}

// 7. Salary & Offer Decision Assistant
export interface OfferComparisonItem {
  id: string;
  userId: string;
  companyName: string;
  roleTitle: string;
  location: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
  fixedCtcLpa: number;
  variableCtcLpa: number;
  joiningBonusInr: number;
  deductionsEstInrMonthly: number;
  netMonthlyTakeHomeEstInr: number;
  benefits: string[];
  growthScore: number;
  cultureScore: number;
  decisionStatus: 'considering' | 'accepted' | 'declined' | 'negotiating';
  notes?: string;
}

// 8. Referral & Networking Tracker
export interface NetworkingContact {
  id: string;
  userId: string;
  name: string;
  company: string;
  role: string;
  relationship: 'Alumni' | 'Recruiter' | 'Senior Engineer' | 'Peer' | 'Campus Senior';
  linkedinUrl?: string;
  email?: string;
  referralStatus: 'not-contacted' | 'reached-out' | 'referral-submitted' | 'referred' | 'closed';
  lastFollowUp?: string;
  nextFollowUpDue?: string;
  notes: string;
  aiDraftedOutreach?: string;
  createdAt: string;
}

// 9. Automated Weekly AI Career Report
export interface WeeklyCareerReport {
  id: string;
  userId: string;
  reportingPeriod: string;
  applicationsSubmittedCount: number;
  interviewsAttendedCount: number;
  roadmapTasksCompletedCount: number;
  skillsPracticedCount: number;
  topStrengths: string[];
  currentBlockers: string[];
  strategicActionItems: string[];
  motivationalSummary: string;
  generatedAt: string;
}

// 10. Achievement & Evidence Profile
export interface CareerAchievement {
  id: string;
  userId: string;
  title: string;
  category: 'Project' | 'Certification' | 'Internship' | 'Hackathon' | 'Academic' | 'Open Source';
  issuerOrOrg: string;
  issueDate: string;
  skillsDemonstrated: string[];
  projectOrCredentialLink?: string;
  metricsResult: string;
  suggestedResumeBullet: string;
  verified: boolean;
}

