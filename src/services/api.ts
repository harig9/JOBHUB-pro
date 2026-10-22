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
};
