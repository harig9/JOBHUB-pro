import React, { useState, useEffect } from 'react';
import {
  User,
  Job,
  JobStatus,
  Resume,
  CoverLetter,
  InterviewSession,
  CareerAnalytics,
  SystemInfo,
} from './types/index.js';
import { api } from './services/api.js';
import { ToastProvider, useToast } from './components/Toast.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar, ActiveTab } from './components/Navbar.js';
import { SystemModal } from './components/SystemModal.js';
import { ProfileModal } from './components/ProfileModal.js';
import { AuthModal } from './components/auth/AuthModal.js';
import { JobBoard } from './components/jobs/JobBoard.js';
import { ScheduleModal } from './components/jobs/ScheduleModal.js';
import { UpcomingAlertBanner } from './components/notifications/UpcomingAlertBanner.js';
import { ResumeStudio } from './components/resumes/ResumeStudio.js';
import { ATSOptimizer } from './components/ats/ATSOptimizer.js';
import { CoverLetterStudio } from './components/coverLetters/CoverLetterStudio.js';
import { InterviewCoach } from './components/interview/InterviewCoach.js';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard.js';
import { ArchitectureStudio } from './components/system/ArchitectureStudio.js';
import { GoogleDriveHub } from './components/drive/GoogleDriveHub.js';
import { JobHubChatbot } from './components/chatbot/JobHubChatbot.js';

// Advanced Career Suite Components
import { JobMatchEngine } from './components/matching/JobMatchEngine.js';
import { CareerRoadmapStudio } from './components/roadmap/CareerRoadmapStudio.js';
import { CodingAptitudeLab } from './components/coding/CodingAptitudeLab.js';
import { SkillGapVisualizer } from './components/skills/SkillGapVisualizer.js';
import { CompanyResearchWorkspace } from './components/company/CompanyResearchWorkspace.js';
import { CareerDocumentVault } from './components/vault/CareerDocumentVault.js';
import { OfferComparisonAssistant } from './components/offers/OfferComparisonAssistant.js';
import { NetworkingTracker } from './components/networking/NetworkingTracker.js';
import { WeeklyCareerReports } from './components/reports/WeeklyCareerReports.js';
import { AchievementProfile } from './components/achievements/AchievementProfile.js';
import { SmartAutofillModal } from './components/autofill/SmartAutofillModal.js';

function MainApp() {
  const { showToast } = useToast();
  const [isAutofillModalOpen, setIsAutofillModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('jobs');
  const [loading, setLoading] = useState(true);

  // Entities
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [analytics, setAnalytics] = useState<CareerAnalytics | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  // Modals
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Authentication Context integration
  const { userProfile, updateUserProfile } = useAuth();

  // Keep application user profile synchronized with authenticated Firebase session
  useEffect(() => {
    if (userProfile) {
      setUser((prev) => ({
        ...(prev || {}),
        ...userProfile,
        id: userProfile.id || prev?.id || 'usr_demo_01',
        fullName: userProfile.fullName || prev?.fullName || 'JobHub Professional',
        email: userProfile.email || prev?.email || '',
        phone: userProfile.phone || prev?.phone || '',
      } as User));
    }
  }, [userProfile]);

  // Inter-tab selections
  const [targetJobForATS, setTargetJobForATS] = useState<Job | null>(null);
  const [targetResumeForATS, setTargetResumeForATS] = useState<Resume | null>(null);
  const [targetJobForLetter, setTargetJobForLetter] = useState<Job | null>(null);
  const [targetJobForInterview, setTargetJobForInterview] = useState<Job | null>(null);
  const [targetResumeForStudio, setTargetResumeForStudio] = useState<Resume | null>(null);
  const [targetInterviewSession, setTargetInterviewSession] = useState<InterviewSession | null>(null);
  const [targetJobForBoard, setTargetJobForBoard] = useState<Job | null>(null);
  const [schedulingJobGlobal, setSchedulingJobGlobal] = useState<Job | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAllData = async (attempts = 3) => {
    setLoading(true);
    setLoadError(null);

    for (let i = 0; i < attempts; i++) {
      try {
        const [uData, jData, rData, cData, iData, aData, sData] = await Promise.all([
          api.getMe(),
          api.getJobs(),
          api.getResumes(),
          api.getCoverLetters(),
          api.getInterviews(),
          api.getAnalytics(),
          api.getSystemInfo(),
        ]);

        setUser(uData.user);
        setJobs(jData);
        setResumes(rData);
        setCoverLetters(cData);
        setInterviews(iData);
        setAnalytics(aData);
        setSystemInfo(sData);
        setLoading(false);
        setLoadError(null);
        return;
      } catch (err: any) {
        if (i < attempts - 1) {
          // Grace period for backend to initialize (500ms * attempt)
          await new Promise((resolve) => setTimeout(resolve, 500 * (i + 1)));
        } else {
          console.error('Failed to load initial application state:', err);
          setLoadError(err.message || 'Unable to connect to the JobHub Pro backend service.');
          setLoading(false);
        }
      }
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const refreshJobs = async () => {
    try {
      const updated = await api.getJobs();
      setJobs(updated);
      const updatedAnalytics = await api.getAnalytics();
      setAnalytics(updatedAnalytics);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshResumes = async () => {
    try {
      const updated = await api.getResumes();
      setResumes(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshCoverLetters = async () => {
    try {
      const updated = await api.getCoverLetters();
      setCoverLetters(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshInterviews = async () => {
    try {
      const updated = await api.getInterviews();
      setInterviews(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Job Actions
  const handleAddJob = async (jobData: Partial<Job>) => {
    try {
      const created = await api.createJob(jobData);
      showToast(`Added ${created.title} at ${created.company}!`, 'success');
      await refreshJobs();
    } catch (err: any) {
      showToast(err.message || 'Failed to create job', 'error');
    }
  };

  const handleUpdateJob = async (id: string, updates: Partial<Job>) => {
    try {
      await api.updateJob(id, updates);
      await refreshJobs();
      showToast('Opportunity updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  const handleUpdateStatus = async (id: string, status: JobStatus, note?: string) => {
    try {
      await api.updateJobStatus(id, status, note);
      await refreshJobs();
      showToast(`Status updated to ${status.toUpperCase()}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Status change failed', 'error');
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await api.deleteJob(id);
      await refreshJobs();
      showToast('Job removed from tracking', 'info');
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  // Profile Save
  const handleSaveProfile = async (updated: Partial<User>) => {
    try {
      const saved = await api.updateProfile(updated);
      setUser(saved);
      try {
        await updateUserProfile(updated);
      } catch (authErr) {
        console.warn('Could not sync user profile to Firestore:', authErr);
      }
      showToast('Profile updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Profile save failed', 'error');
    }
  };

  // Cross-Navigation handlers
  const handleSelectJobForATS = (job: Job) => {
    setTargetJobForATS(job);
    setActiveTab('ats');
  };

  const handleSelectResumeForATS = (resume: Resume) => {
    setTargetResumeForATS(resume);
    setActiveTab('ats');
  };

  const handleSelectJobForCoverLetter = (job: Job) => {
    setTargetJobForLetter(job);
    setActiveTab('coverLetters');
  };

  const handleSelectJobForInterview = (job: Job) => {
    setTargetJobForInterview(job);
    setActiveTab('interviews');
  };

  const handleSelectJobFromSearch = (job: Job) => {
    setTargetJobForBoard(job);
    setActiveTab('jobs');
  };

  const handleSelectResumeFromSearch = (resume: Resume) => {
    setTargetResumeForStudio(resume);
    setActiveTab('resumes');
  };

  const handleSelectInterviewFromSearch = (session: InterviewSession) => {
    setTargetInterviewSession(session);
    setActiveTab('interviews');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-5 transition-colors">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2.5 flex items-center justify-center animate-pulse">
            <img
              src="/jobhub-logo.png"
              alt="JobHub Pro — AI Career Suite"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-950 flex items-center justify-center shadow">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            JobHub Pro
          </h2>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            AI Career Suite
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
            Loading your career acceleration workspaces...
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-5 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Connection Synchronizing</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {loadError}
            </p>
          </div>
          <button
            onClick={() => loadAllData(3)}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const avgScore = analytics?.avgMatchScore || 88;

  return (
    <NotificationProvider jobs={jobs}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
        {/* Navigation Header with Global Search */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          systemInfo={systemInfo}
          onOpenSystemModal={() => setIsSystemModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          avgScore={avgScore}
          jobs={jobs}
          resumes={resumes}
          interviews={interviews}
          onSelectJob={handleSelectJobFromSearch}
          onSelectResume={handleSelectResumeFromSearch}
          onSelectInterview={handleSelectInterviewFromSearch}
          onSelectJobForInterview={handleSelectJobForInterview}
          onSelectJobForATS={handleSelectJobForATS}
          onOpenScheduleModal={(job) => setSchedulingJobGlobal(job)}
          onOpenAutofillModal={() => setIsAutofillModalOpen(true)}
        />

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Urgent Deadlines & Scheduled Interview Banner */}
          <UpcomingAlertBanner
            jobs={jobs}
            onNavigateTab={setActiveTab}
            onSelectJobForInterview={handleSelectJobForInterview}
            onSelectJobForATS={handleSelectJobForATS}
          />

          {activeTab === 'jobs' && (
            <JobBoard
              jobs={jobs}
              targetJob={targetJobForBoard}
              onAddJob={handleAddJob}
              onUpdateJob={handleUpdateJob}
              onUpdateStatus={handleUpdateStatus}
              onDeleteJob={handleDeleteJob}
              onSelectJobForATS={handleSelectJobForATS}
              onSelectJobForCoverLetter={handleSelectJobForCoverLetter}
              onSelectJobForInterview={handleSelectJobForInterview}
            />
          )}

          {activeTab === 'matching' && (
            <JobMatchEngine
              resumes={resumes}
              jobs={jobs}
              onSelectJobForATS={(job) => {
                handleSelectJobForATS(job);
                setActiveTab('ats');
              }}
              onRefreshJobs={refreshJobs}
            />
          )}

          {activeTab === 'resumes' && (
            <ResumeStudio
              resumes={resumes}
              initialResumeId={targetResumeForStudio?.id}
              onSelectResumeForATS={handleSelectResumeForATS}
              onRefreshResumes={refreshResumes}
            />
          )}

          {activeTab === 'ats' && (
            <ATSOptimizer
              resumes={resumes}
              jobs={jobs}
              initialResumeId={targetResumeForATS?.id}
              initialJobId={targetJobForATS?.id}
              onRefreshResumes={refreshResumes}
              onRefreshJobs={refreshJobs}
            />
          )}

          {activeTab === 'coverLetters' && (
            <CoverLetterStudio
              coverLetters={coverLetters}
              jobs={jobs}
              resumes={resumes}
              initialJobId={targetJobForLetter?.id}
              onRefreshCoverLetters={refreshCoverLetters}
            />
          )}

          {activeTab === 'interviews' && (
            <InterviewCoach
              sessions={interviews}
              jobs={jobs}
              initialJobId={targetJobForInterview?.id}
              initialSessionId={targetInterviewSession?.id}
              onRefreshInterviews={refreshInterviews}
            />
          )}

          {activeTab === 'roadmap' && (
            <CareerRoadmapStudio
              onNavigateToCodingLab={() => setActiveTab('codingLab')}
              onNavigateToSkillGap={() => setActiveTab('skills')}
              onNavigateToInterviewCoach={() => setActiveTab('interviews')}
            />
          )}

          {activeTab === 'codingLab' && (
            <CodingAptitudeLab />
          )}

          {activeTab === 'skills' && (
            <SkillGapVisualizer
              onNavigateToRoadmap={() => setActiveTab('roadmap')}
              onNavigateToCodingLab={() => setActiveTab('codingLab')}
            />
          )}

          {activeTab === 'company' && (
            <CompanyResearchWorkspace
              onStartCompanyInterview={() => {
                setActiveTab('interviews');
              }}
            />
          )}

          {activeTab === 'offers' && (
            <OfferComparisonAssistant />
          )}

          {activeTab === 'networking' && (
            <NetworkingTracker />
          )}

          {activeTab === 'vault' && (
            <div className="space-y-8">
              <CareerDocumentVault />
              <AchievementProfile />
            </div>
          )}

          {activeTab === 'reports' && (
            <WeeklyCareerReports />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard analytics={analytics} />
          )}

          {activeTab === 'drive' && (
            <GoogleDriveHub
              resumes={resumes}
              onRefreshResumes={refreshResumes}
              onImportResumeToStudio={() => {
                setActiveTab('resumes');
              }}
            />
          )}

          {activeTab === 'architecture' && (
            <ArchitectureStudio />
          )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 shrink-0 flex items-center justify-center shadow-2xs">
              <img
                src="/jobhub-logo.png"
                alt="JobHub Pro"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">JobHub Pro</span>
            <span>•</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">AI Career Suite</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSystemModalOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Spring Boot REST Spec & Database Audit
            </button>
            <span>•</span>
            <span>Gemini 3.8 Flash Active</span>
          </div>
        </div>
      </footer>

      {/* Architecture Disclosure Modal */}
      <SystemModal
        isOpen={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
        systemInfo={systemInfo}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onSave={handleSaveProfile}
      />

      {/* Multi-Method Authentication Modal (Google OAuth, Phone OTP, Email/Pass) */}
      <AuthModal />

      {/* Global Schedule Modal from Notifications */}
      {schedulingJobGlobal && (
        <ScheduleModal
          isOpen={!!schedulingJobGlobal}
          onClose={() => setSchedulingJobGlobal(null)}
          job={schedulingJobGlobal}
          onJobUpdated={async (updated) => {
            await handleUpdateJob(updated.id, updated);
            setSchedulingJobGlobal(null);
          }}
        />
      )}

      {/* Smart Application Autofill Modal */}
      <SmartAutofillModal
        isOpen={isAutofillModalOpen}
        onClose={() => setIsAutofillModalOpen(false)}
      />

      {/* JobHub Pro AI Assistant Chatbot */}
      <JobHubChatbot
        jobs={jobs}
        resumes={resumes}
        onNavigateTab={setActiveTab}
      />
    </div>
    </NotificationProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
