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

