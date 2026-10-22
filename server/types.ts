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
  endDate: string; // or "Present"
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
  category: string; // e.g. "Languages", "Frameworks & Libs", "Cloud & DevOps", "Databases & Storage", "Tools & Methodologies"
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
  templateId: 'modern-clean' | 'executive-serif' | 'tech-minimal' | 'compact-ats';
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
    score: number; // 1-10
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
  interviewRate: number; // percentage
  offerRate: number; // percentage
  avgMatchScore: number;
  topSkillsInDemand: { skill: string; count: number; userHasSkill: boolean }[];
  applicationsTimeline: { date: string; count: number }[];
  pipelineFunnel: { stage: string; count: number; percentage: number }[];
}

export interface SpringStyleApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}
