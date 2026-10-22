import React, { useState, useRef, useEffect } from 'react';
import {
  Briefcase,
  FileText,
  Target,
  Mail,
  Mic,
  BarChart3,
  Server,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  Palette,
  Check,
  LogIn,
} from 'lucide-react';
import { User, SystemInfo, Job, Resume, InterviewSession } from '../types/index.js';
import { useTheme, AccentColor } from '../context/ThemeContext.js';
import { useAuth } from '../context/AuthContext.js';
import { NotificationCenter } from './notifications/NotificationCenter.js';
import { GlobalSearch } from './search/GlobalSearch.js';

export type ActiveTab = 'jobs' | 'resumes' | 'ats' | 'coverLetters' | 'interviews' | 'analytics' | 'architecture';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: User | null;
  systemInfo: SystemInfo | null;
  onOpenSystemModal: () => void;
  onOpenProfileModal: () => void;
  avgScore: number;
  jobs: Job[];
  resumes?: Resume[];
  interviews?: InterviewSession[];
  onSelectJob?: (job: Job) => void;
  onSelectResume?: (resume: Resume) => void;
  onSelectInterview?: (interview: InterviewSession) => void;
  onSelectJobForInterview: (job: Job) => void;
  onSelectJobForATS: (job: Job) => void;
  onOpenScheduleModal: (job: Job) => void;
}

const ACCENT_OPTIONS: { id: AccentColor; label: string; bgClass: string }[] = [
  { id: 'indigo', label: 'Indigo', bgClass: 'bg-indigo-600' },
  { id: 'blue', label: 'Sapphire Blue', bgClass: 'bg-blue-600' },
  { id: 'emerald', label: 'Emerald', bgClass: 'bg-emerald-600' },
  { id: 'violet', label: 'Royal Violet', bgClass: 'bg-violet-600' },
  { id: 'slate', label: 'Executive Slate', bgClass: 'bg-slate-700' },
];

export function Navbar({
  activeTab,
  setActiveTab,
  user,
  systemInfo,
  onOpenSystemModal,
  onOpenProfileModal,
  avgScore,
  jobs,
  resumes = [],
  interviews = [],
  onSelectJob,
  onSelectResume,
  onSelectInterview,
  onSelectJobForInterview,
  onSelectJobForATS,
  onOpenScheduleModal,
}: NavbarProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const { currentUser, openAuthModal } = useAuth();
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const colorMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorMenuRef.current && !colorMenuRef.current.contains(event.target as Node)) {
        setIsColorMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs = [
    { id: 'jobs', label: 'Job Tracker', icon: Briefcase, tag: undefined },
    { id: 'resumes', label: 'Resume Studio', icon: FileText, tag: 'Editor' },
    { id: 'ats', label: 'ATS 85%+ Optimizer', icon: Target, tag: 'AI Scoring' },
    { id: 'coverLetters', label: 'Cover Letters', icon: Mail, tag: undefined },
    { id: 'interviews', label: 'Interview Coach', icon: Mic, tag: 'STAR Prep' },
    { id: 'analytics', label: 'Career Analytics', icon: BarChart3, tag: undefined },
    { id: 'architecture', label: 'Architecture & SQL', icon: Server, tag: 'REST & DB' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 p-0.5 shadow-sm flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  JobHub Pro
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden sm:inline">
                  Career Suite
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal hidden xl:block">
                ATS 85%+ Optimization & Application Intelligence
              </p>
            </div>
          </div>

          {/* Global Search Bar (Quickly finds jobs, resumes, and interview sessions) */}
          <div className="flex-1 max-w-sm sm:max-w-md lg:max-w-lg min-w-0 mx-1 sm:mx-3">
            <GlobalSearch
              jobs={jobs}
              resumes={resumes}
              interviews={interviews}
              onNavigateTab={setActiveTab}
              onSelectJob={onSelectJob}
              onSelectResume={onSelectResume}
              onSelectInterview={onSelectInterview}
              onSelectJobForATS={onSelectJobForATS}
              onSelectJobForInterview={onSelectJobForInterview}
            />
          </div>

          {/* Quick System Badges */}
          <div className="hidden 2xl:flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenSystemModal}
              title="Click to view full architecture & Spring Boot REST specification audit"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-xs cursor-pointer"
            >
              <span className="text-slate-500 dark:text-slate-400 font-medium">REST Engine:</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold font-mono text-[11px]">
                Spring Boot Spec
              </span>
            </button>

            <button
              onClick={onOpenSystemModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-violet-400" />
              <span className="font-mono text-[11px]">gemini-3.8-flash</span>
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">Avg ATS:</span>
              <strong className="text-indigo-600 dark:text-indigo-400 font-bold font-mono tabular-nums">
                {avgScore}%
              </strong>
            </div>
          </div>

          {/* Controls: Notifications + Theme Toggle + Accent Color + User Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Career Deadlines & Interview Notification Center */}
            <NotificationCenter
              jobs={jobs}
              onNavigateTab={setActiveTab}
              onSelectJobForInterview={onSelectJobForInterview}
              onSelectJobForATS={onSelectJobForATS}
              onOpenScheduleModal={onOpenScheduleModal}
            />

            {/* UI Color Palette Picker */}
            <div className="relative" ref={colorMenuRef}>
              <button
                onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
                title="Change UI Theme Color"
                aria-label="Change UI Color"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                <Palette className="w-4 h-4" />
              </button>

              {isColorMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                    Theme Accent Color
                  </div>
                  {ACCENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setAccentColor(opt.id);
                        setIsColorMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${opt.bgClass}`} />
                        <span>{opt.label}</span>
                      </div>
                      {accentColor === opt.id && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Quick Sign In / Register Button if not logged into personal account */}
            {!currentUser && (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* User Profile Avatar */}
            <button
              onClick={onOpenProfileModal}
              title="View Account & Security Settings"
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors text-left cursor-pointer"
            >
              <div className="relative w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user?.fullName
                  ? user.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                  : 'AM'}
                {currentUser && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
                )}
              </div>
              <div className="hidden md:block pr-1.5">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {user?.fullName || 'Alex Morgan'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[120px]">
                  {currentUser ? 'Verified Account' : user?.targetRole || 'Staff Architect'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-200 dark:border-slate-800/80 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.tag && (
                  <span
                    className={`text-[10px] font-medium opacity-80 ${
                      isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    · {tab.tag}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
