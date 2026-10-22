import {
  User,
  Job,
  JobStatus,
  Resume,
  CoverLetter,
  InterviewSession,
  InterviewQuestion,
  ATSScanResult,
  CareerAnalytics,
  SystemInfo,
  JobMatchResult,
  CareerRoadmap,
  AptitudeQuestionItem,
  PracticeSubmission,
  SkillGapNode,
  CompanyResearchPack,
  CareerVaultDocument,
  OfferComparisonItem,
  NetworkingContact,
  WeeklyCareerReport,
  CareerAchievement,
} from '../types/index.js';

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    let errorDetail = 'Request failed';
    if (contentType.includes('application/json')) {
      try {
        const errJson = await res.json();
        errorDetail = errJson.message || errJson.error || JSON.stringify(errJson);
      } catch {
        errorDetail = `HTTP Error ${res.status}: ${res.statusText}`;
      }
    } else {
      errorDetail = `Server returned HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  // Verify response is JSON
  if (contentType.includes('application/json')) {
    return res.json();
  }

  // If server returned non-JSON (e.g. HTML during initial boot)
  const rawText = await res.text();
  if (rawText.trim().startsWith('<')) {
    throw new Error(`Server returned HTML instead of JSON. The backend service may still be warming up.`);
  }

  try {
    return JSON.parse(rawText) as T;
  } catch {
    throw new Error(`Failed to parse server response as JSON`);
  }
}

export const api = {
  // Auth & Profile
  async getMe(): Promise<{ user: User; token: string; authenticated: boolean; roles: string[] }> {
    const res = await fetch('/api/auth/me');
    return handleResponse(res);
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  // Jobs
  async getJobs(params?: { status?: string; search?: string; priority?: string; sort?: string }): Promise<Job[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.sort) query.set('sort', params.sort);

    const res = await fetch(`/api/jobs?${query.toString()}`);
    return handleResponse(res);
  },

  async getJobById(id: string): Promise<Job> {
    const res = await fetch(`/api/jobs/${id}`);
    return handleResponse(res);
  },

  async createJob(job: Partial<Job>): Promise<Job> {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    });
    return handleResponse(res);
  },

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  async updateJobStatus(id: string, status: JobStatus, note?: string): Promise<Job> {
    const res = await fetch(`/api/jobs/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
    return handleResponse(res);
  },

  async deleteJob(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  async scheduleJob(
    id: string,
    scheduleData: {
      interviewDate?: string;
      interviewRound?: string;
      deadline?: string;
      followUpDate?: string;
      notes?: string;
    }
  ): Promise<Job> {
    const res = await fetch(`/api/jobs/${id}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData),
    });
    return handleResponse(res);
  },

  // Resumes
  async getResumes(): Promise<Resume[]> {
    const res = await fetch('/api/resumes');
    return handleResponse(res);
  },

  async getResumeById(id: string): Promise<Resume> {
    const res = await fetch(`/api/resumes/${id}`);
    return handleResponse(res);
  },

  async createResume(resume: Partial<Resume>): Promise<Resume> {
    const res = await fetch('/api/resumes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resume),
    });
    return handleResponse(res);
  },

  async updateResume(id: string, updates: Partial<Resume>): Promise<Resume> {
    const res = await fetch(`/api/resumes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  async duplicateResume(id: string): Promise<Resume> {
    const res = await fetch(`/api/resumes/${id}/duplicate`, { method: 'POST' });
    return handleResponse(res);
  },

  async setPrimaryResume(id: string): Promise<Resume> {
    const res = await fetch(`/api/resumes/${id}/set-primary`, { method: 'POST' });
    return handleResponse(res);
  },

  async deleteResume(id: string): Promise<{ message: string }> {
    const res = await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // AI & ATS
  async scanATS(payload: {
    resumeId?: string;
    jobDescription: string;
    jobId?: string;
    jobTitle?: string;
    company?: string;
  }): Promise<ATSScanResult> {
    const res = await fetch('/api/ai/ats-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async optimizeResumeATS(payload: {
    resumeId?: string;
    jobDescription: string;
    targetScore?: number;
    saveAsNew?: boolean;
  }): Promise<{
    success: boolean;
    optimizedResume: Resume;
    newScore: number;
    changesSummary: string[];
    keywordImprovements: string[];
    message: string;
  }> {
    const res = await fetch('/api/ai/optimize-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async generateCoverLetter(payload: {
    resumeId?: string;
    jobId?: string;
    jobTitle?: string;
    company?: string;
    jobDescription?: string;
    tone?: string;
    length?: string;
    instructions?: string;
    recipientName?: string;
  }): Promise<CoverLetter> {
    const res = await fetch('/api/ai/cover-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async generateInterviewPrep(payload: {
    jobTitle: string;
    company: string;
    jobDescription?: string;
    count?: number;
    jobId?: string;
  }): Promise<InterviewSession> {
    const res = await fetch('/api/ai/interview-prep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async evaluateAnswer(payload: {
    sessionId: string;
    questionId: string;
    userAnswer: string;
  }): Promise<{
    questionId: string;
    userAnswer: string;
    evaluation: InterviewQuestion['evaluation'];
    sessionOverallScore: number;
  }> {
    const res = await fetch('/api/ai/evaluate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async parseResumeText(rawText: string): Promise<Partial<Resume>> {
    const res = await fetch('/api/ai/parse-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
    });
    return handleResponse(res);
  },

  async generateFollowUpEmail(payload: {
    jobId?: string;
    type: 'post_interview_thank_you' | 'application_follow_up' | 'offer_negotiation';
    notes?: string;
  }): Promise<{ subject: string; body: string }> {
    const res = await fetch('/api/ai/follow-up-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async generateInterviewCheatSheet(payload: {
    jobId?: string;
  }): Promise<{
    killerQuestionsToAsk: string[];
    companyTalkingPoints: string[];
    coreMetricsToHighlight: string[];
    redFlagsToWatchFor: string[];
  }> {
    const res = await fetch('/api/ai/interview-cheat-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Cover Letters
  async getCoverLetters(): Promise<CoverLetter[]> {
    const res = await fetch('/api/cover-letters');
    return handleResponse(res);
  },

  async updateCoverLetter(id: string, updates: Partial<CoverLetter>): Promise<CoverLetter> {
    const res = await fetch(`/api/cover-letters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  async deleteCoverLetter(id: string): Promise<{ message: string }> {
    const res = await fetch(`/api/cover-letters/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // Interviews
  async getInterviews(): Promise<InterviewSession[]> {
    const res = await fetch('/api/interviews');
    return handleResponse(res);
  },

  // Analytics
  async getAnalytics(): Promise<CareerAnalytics> {
    const res = await fetch('/api/analytics');
    return handleResponse(res);
  },

  // System Diagnostics & SQL Studio
  async getSystemInfo(): Promise<SystemInfo> {
    const res = await fetch('/api/system/info');
    return handleResponse(res);
  },

  async getDatabaseSchema(): Promise<{
    mysqlSchemaDdl: string;
    springBootController: string;
    springSecurityConfig: string;
    tables: { name: string; rows: number; columns: string[] }[];
  }> {
    const res = await fetch('/api/system/schema');
    return handleResponse(res);
  },

  async executeSqlQuery(query: string): Promise<{
    query: string;
    table: string;
    columns: string[];
    rows: any[];
    rowCount: number;
    executionTimeMs: number;
    explainPlan: {
      selectType: string;
      table: string;
      type: string;
      possibleKeys: string[];
      keyUsed: string;
      rowsExamined: number;
      filtered: string;
    };
  }> {
    const res = await fetch('/api/system/sql-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return handleResponse(res);
  },

  // Document Text Extraction (DOCX, PDF, TXT)
  async extractDocumentText(file: File): Promise<{
    fileName: string;
    fileSize: number;
    charCount: number;
    extractedText: string;
  }> {
    return new Promise((resolve, reject) => {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return reject(new Error('File exceeds maximum allowed size of 5MB'));
      }

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = reader.result as string;
          // Extract base64 part
          const base64Data = result.split(',')[1] || result;
          const res = await fetch('/api/documents/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              mimeType: file.type,
              base64Data,
            }),
          });
          const data = await handleResponse<any>(res);
          resolve(data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read document file'));
      reader.readAsDataURL(file);
    });
  },

  // AI Chatbot
  async sendChatMessage(
    messages: { role: string; content: string }[],
    context?: any
  ): Promise<{ reply: string; timestamp: string }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context }),
    });
    return handleResponse(res);
  },

  // 1. AI Job Match Engine
  async getJobMatches(resumeId?: string): Promise<JobMatchResult[]> {
    const q = resumeId ? `?resumeId=${resumeId}` : '';
    const res = await fetch(`/api/career/match${q}`);
    return handleResponse(res);
  },

  // 2. Career Roadmap
  async getRoadmaps(): Promise<CareerRoadmap[]> {
    const res = await fetch('/api/career/roadmap');
    return handleResponse(res);
  },

  async toggleRoadmapTask(roadmapId: string, taskId: string): Promise<CareerRoadmap> {
    const res = await fetch('/api/career/roadmap/toggle-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roadmapId, taskId }),
    });
    return handleResponse(res);
  },

  // 3. Coding & Aptitude Lab
  async getCodingQuestions(category?: string, difficulty?: string): Promise<{ questions: AptitudeQuestionItem[]; submissions: PracticeSubmission[] }> {
    const query = new URLSearchParams();
    if (category) query.set('category', category);
    if (difficulty) query.set('difficulty', difficulty);
    const res = await fetch(`/api/career/coding-lab?${query.toString()}`);
    return handleResponse(res);
  },

  async submitPracticeAnswer(payload: {
    questionId: string;
    selectedOption?: number;
    submittedCode?: string;
    timeSpentSeconds?: number;
  }): Promise<{ submission: PracticeSubmission; explanation: string; correctOptionIndex?: number }> {
    const res = await fetch('/api/career/coding-lab/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // 4. Skill Gap Visualizer
  async getSkillGaps(): Promise<SkillGapNode[]> {
    const res = await fetch('/api/career/skill-gap');
    return handleResponse(res);
  },

  async updateSkillProficiency(skillId: string, proficiency: SkillGapNode['userProficiency']): Promise<SkillGapNode> {
    const res = await fetch(`/api/career/skill-gap/${skillId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proficiency }),
    });
    return handleResponse(res);
  },

  // 5. Company Packs
  async getCompanyPacks(): Promise<CompanyResearchPack[]> {
    const res = await fetch('/api/career/company-packs');
    return handleResponse(res);
  },

  async toggleCompanyChecklist(packId: string, task: string): Promise<CompanyResearchPack> {
    const res = await fetch('/api/career/company-packs/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packId, task }),
    });
    return handleResponse(res);
  },

  // 6. Career Document Vault
  async getVaultDocuments(): Promise<CareerVaultDocument[]> {
    const res = await fetch('/api/career/vault');
    return handleResponse(res);
  },

  async addVaultDocument(doc: {
    name: string;
    category: CareerVaultDocument['category'];
    fileSize?: string;
    fileType?: string;
    notes?: string;
    verified?: boolean;
  }): Promise<CareerVaultDocument> {
    const res = await fetch('/api/career/vault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    return handleResponse(res);
  },

  async deleteVaultDocument(id: string): Promise<{ message: string }> {
    const res = await fetch(`/api/career/vault/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // 7. Salary & Offer Decision Assistant
  async getJobOffers(): Promise<OfferComparisonItem[]> {
    const res = await fetch('/api/career/offers');
    return handleResponse(res);
  },

  async saveJobOffer(offer: Partial<OfferComparisonItem>): Promise<OfferComparisonItem> {
    const res = await fetch('/api/career/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offer),
    });
    return handleResponse(res);
  },

  // 8. Referral & Networking Tracker
  async getNetworkingContacts(): Promise<NetworkingContact[]> {
    const res = await fetch('/api/career/networking');
    return handleResponse(res);
  },

  async saveNetworkingContact(contact: Partial<NetworkingContact>): Promise<NetworkingContact> {
    const res = await fetch('/api/career/networking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    });
    return handleResponse(res);
  },

  // 9. Automated Weekly AI Career Report
  async getWeeklyReports(): Promise<WeeklyCareerReport[]> {
    const res = await fetch('/api/career/reports/weekly');
    return handleResponse(res);
  },

  async generateWeeklyReport(): Promise<WeeklyCareerReport> {
    const res = await fetch('/api/career/reports/weekly/generate', {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // 10. Achievements
  async getAchievements(): Promise<CareerAchievement[]> {
    const res = await fetch('/api/career/achievements');
    return handleResponse(res);
  },

  async saveAchievement(ach: Partial<CareerAchievement>): Promise<CareerAchievement> {
    const res = await fetch('/api/career/achievements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ach),
    });
    return handleResponse(res);
  },

  // 11. Smart Autofill
  async getAutofillMapping(): Promise<{
    candidateName: string;
    mappedFields: { fieldName: string; value: string; confidence: string; source: string }[];
    auditTimestamp: string;
    disclaimer: string;
  }> {
    const res = await fetch('/api/career/autofill', {
      method: 'POST',
    });
    return handleResponse(res);
  },
};
