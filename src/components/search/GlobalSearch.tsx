import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  Briefcase,
  FileText,
  Mic,
  Calendar,
  Building2,
  ArrowRight,
  Sparkles,
  Command,
  Clock,
  Target,
  ExternalLink,
} from 'lucide-react';
import { Job, Resume, InterviewSession } from '../../types/index.js';
import { ActiveTab } from '../Navbar.js';
import { useTheme, AccentColor } from '../../context/ThemeContext.js';

interface GlobalSearchProps {
  jobs: Job[];
  resumes?: Resume[];
  interviews?: InterviewSession[];
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectJob?: (job: Job) => void;
  onSelectResume?: (resume: Resume) => void;
  onSelectInterview?: (interview: InterviewSession) => void;
  onSelectJobForATS?: (job: Job) => void;
  onSelectJobForInterview?: (job: Job) => void;
}

type FilterCategory = 'all' | 'jobs' | 'resumes' | 'interviews';
type BadgeVariant = 'default' | 'success' | 'warning' | 'info' | 'primary';

interface SearchResultItem {
  id: string;
  type: 'job' | 'resume' | 'interview';
  title: string;
  company?: string;
  subtitle: string;
  badge?: {
    text: string;
    variant: BadgeVariant;
  };
  extraInfo?: string;
  rawItem: Job | Resume | InterviewSession;
}

const ACCENT_TEXT_CLASSES: Record<AccentColor, string> = {
  indigo: 'text-indigo-600 dark:text-indigo-400',
  blue: 'text-blue-600 dark:text-blue-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  violet: 'text-violet-600 dark:text-violet-400',
  slate: 'text-slate-800 dark:text-slate-200',
};

const ACCENT_RING_CLASSES: Record<AccentColor, string> = {
  indigo: 'focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500',
  blue: 'focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500',
  emerald: 'focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500',
  violet: 'focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500',
  slate: 'focus-within:ring-2 focus-within:ring-slate-500/20 focus-within:border-slate-600',
};

const ACCENT_ACTIVE_BG: Record<AccentColor, string> = {
  indigo: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60',
  blue: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
  violet: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800/60',
  slate: 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700',
};

export function GlobalSearch({
  jobs = [],
  resumes = [],
  interviews = [],
  onNavigateTab,
  onSelectJob,
  onSelectResume,
  onSelectInterview,
  onSelectJobForATS,
  onSelectJobForInterview,
}: GlobalSearchProps) {
  const { accentColor } = useTheme();
  const accentTextClass = ACCENT_TEXT_CLASSES[accentColor] || ACCENT_TEXT_CLASSES.indigo;
  const accentRingClass = ACCENT_RING_CLASSES[accentColor] || ACCENT_RING_CLASSES.indigo;
  const accentActiveBgClass = ACCENT_ACTIVE_BG[accentColor] || ACCENT_ACTIVE_BG.indigo;

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect OS for shortcut hint (Mac: ⌘K, Windows/Linux: Ctrl+K)
  const isMac = useMemo(() => {
    return typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  }, []);

  // Global Keyboard listener for Cmd+K / Ctrl+K and /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      // Press '/' to search when not focused in an input/textarea
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search Results filtering
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    const jobResults: SearchResultItem[] = [];
    const resumeResults: SearchResultItem[] = [];
    const interviewResults: SearchResultItem[] = [];

    // Filter Jobs
    jobs.forEach((job) => {
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchCompany = job.company.toLowerCase().includes(q);
      const matchLocation = job.location?.toLowerCase().includes(q);
      const matchSkills = job.keySkills?.some((s) => s.toLowerCase().includes(q));

      if (!q || matchTitle || matchCompany || matchLocation || matchSkills) {
        let badgeVariant: BadgeVariant = 'default';
        if (job.status === 'offer') badgeVariant = 'success';
        else if (job.status === 'interviewing') badgeVariant = 'warning';
        else if (job.status === 'applied') badgeVariant = 'info';

        let extraInfo = job.location || '';
        if (job.interviewDate) {
          const dateStr = new Date(job.interviewDate).toLocaleDateString([], { month: 'short', day: 'numeric' });
          extraInfo = `Interview on ${dateStr}`;
        } else if (job.deadline) {
          const dateStr = new Date(job.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' });
          extraInfo = `Deadline: ${dateStr}`;
        }

        jobResults.push({
          id: `job_${job.id}`,
          type: 'job',
          title: job.title,
          company: job.company,
          subtitle: `${job.company} • ${job.location || 'Remote'}`,
          badge: {
            text: job.status.toUpperCase(),
            variant: badgeVariant,
          },
          extraInfo,
          rawItem: job,
        });
      }
    });

    // Filter Resumes
    resumes.forEach((resume) => {
      const targetRoleStr = resume.targetRoles?.[0] || 'Technical Role';
      const matchTitle = resume.title.toLowerCase().includes(q);
      const matchTargetRole = resume.targetRoles?.some((r) => r.toLowerCase().includes(q));
      const matchExperiences = resume.experiences?.some(
        (exp) => exp.company.toLowerCase().includes(q) || exp.position.toLowerCase().includes(q)
      );

      if (!q || matchTitle || matchTargetRole || matchExperiences) {
        resumeResults.push({
          id: `res_${resume.id}`,
          type: 'resume',
          title: resume.title,
          company: targetRoleStr,
          subtitle: `Target: ${targetRoleStr}`,
          badge: resume.isPrimary
            ? { text: 'PRIMARY', variant: 'primary' }
            : { text: 'CV DRAFT', variant: 'default' },
          extraInfo: resume.updatedAt
            ? `Updated ${new Date(resume.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
            : undefined,
          rawItem: resume,
        });
      }
    });

    // Filter Interview Sessions
    interviews.forEach((session) => {
      const matchTitle = session.jobTitle.toLowerCase().includes(q);
      const matchCompany = session.company.toLowerCase().includes(q);

      if (!q || matchTitle || matchCompany) {
        let badgeVariant: BadgeVariant = 'info';
        if (session.status === 'completed') badgeVariant = 'success';
        else if (session.status === 'in-progress') badgeVariant = 'warning';

        interviewResults.push({
          id: `int_${session.id}`,
          type: 'interview',
          title: session.jobTitle,
          company: session.company,
          subtitle: `${session.company} • ${session.questions?.length || 0} Questions`,
          badge: {
            text: session.status.toUpperCase(),
            variant: badgeVariant,
          },
          extraInfo: session.overallScore ? `Score: ${session.overallScore}%` : session.experienceLevel,
          rawItem: session,
        });
      }
    });

    return {
      all: [...jobResults, ...resumeResults, ...interviewResults],
      jobs: jobResults,
      resumes: resumeResults,
      interviews: interviewResults,
    };
  }, [jobs, resumes, interviews, query]);

  const displayedResults = useMemo(() => {
    return searchResults[activeCategory];
  }, [searchResults, activeCategory]);

  // Keep highlighted index within bounds
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, activeCategory]);

  const handleSelectItem = (item: SearchResultItem) => {
    setIsOpen(false);
    setQuery('');

    if (item.type === 'job') {
      const job = item.rawItem as Job;
      if (onSelectJob) {
        onSelectJob(job);
      } else {
        onNavigateTab('jobs');
      }
    } else if (item.type === 'resume') {
      const resume = item.rawItem as Resume;
      if (onSelectResume) {
        onSelectResume(resume);
      } else {
        onNavigateTab('resumes');
      }
    } else if (item.type === 'interview') {
      const session = item.rawItem as InterviewSession;
      if (onSelectInterview) {
        onSelectInterview(session);
      } else {
        onNavigateTab('interviews');
      }
    }
  };

  // Keyboard navigation within dropdown
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < displayedResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : displayedResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (displayedResults[highlightedIndex]) {
        handleSelectItem(displayedResults[highlightedIndex]);
      }
    }
  };

  const getBadgeClasses = (variant?: BadgeVariant) => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'warning':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'info':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border-sky-200 dark:border-sky-800';
      case 'primary':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getItemIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'job':
        return <Briefcase className="w-4 h-4 text-indigo-500" />;
      case 'resume':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'interview':
        return <Mic className="w-4 h-4 text-amber-500" />;
    }
  };

  const renderHighlighted = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark
          key={i}
          className="bg-amber-200/60 dark:bg-amber-500/30 text-slate-900 dark:text-slate-100 rounded-xs px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Bar Input Container */}
      <div
        className={`relative flex items-center w-full rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 transition-all ${accentRingClass}`}
      >
        <div className="pl-3.5 pr-2 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder="Search jobs, resumes, interviews... (Ctrl+K)"
          className="w-full py-2 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1 mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Keyboard shortcut hint badge */}
        <div className="pr-2.5 hidden sm:flex items-center">
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>
        </div>
      </div>

      {/* Dropdown Results Palette */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150">
          {/* Category Filter Pills */}
          <div className="px-3 pt-2.5 pb-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              All ({searchResults.all.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('jobs')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === 'jobs'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-3 h-3" />
              <span>Jobs ({searchResults.jobs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('resumes')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === 'resumes'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Resumes ({searchResults.resumes.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('interviews')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === 'interviews'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Mic className="w-3 h-3" />
              <span>Interviews ({searchResults.interviews.length})</span>
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-[360px] overflow-y-auto p-1.5 space-y-1">
            {displayedResults.length > 0 ? (
              displayedResults.map((item, idx) => {
                const isSelected = idx === highlightedIndex;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                      isSelected
                        ? accentActiveBgClass
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-center shrink-0">
                        {getItemIcon(item.type)}
                      </div>

                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {renderHighlighted(item.title, query)}
                          </h4>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${getBadgeClasses(
                                item.badge.variant
                              )}`}
                            >
                              {item.badge.text}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.company && (
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {renderHighlighted(item.company, query)}
                            </span>
                          )}
                          {item.extraInfo && (
                            <>
                              <span>•</span>
                              <span>{item.extraInfo}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Pill on the right */}
                    <div className="flex items-center gap-1 shrink-0">
                      {item.type === 'job' && onSelectJobForInterview && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                            onSelectJobForInterview(item.rawItem as Job);
                          }}
                          title="Prepare STAR Mock Interview for this Job"
                          className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950/60 text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                        >
                          <Mic className="w-3 h-3" />
                          <span>STAR Prep</span>
                        </button>
                      )}

                      {item.type === 'job' && onSelectJobForATS && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                            onSelectJobForATS(item.rawItem as Job);
                          }}
                          title="Match Resume & Score ATS for this Job"
                          className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-slate-100 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                        >
                          <Target className="w-3 h-3" />
                          <span>ATS Scan</span>
                        </button>
                      )}

                      <span className="p-1 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-2.5">
                  <Search className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No matching {activeCategory !== 'all' ? activeCategory : 'items'} found
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Try searching for a company name like &ldquo;Stripe&rdquo; or &ldquo;Canva&rdquo;, a title like &ldquo;Engineer&rdquo; or &ldquo;Architect&rdquo;.
                </p>
              </div>
            )}
          </div>

          {/* Footer Guide */}
          <div className="px-3.5 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 flex items-center justify-between text-[10px] text-slate-400 select-none">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                  ↑
                </kbd>{' '}
                <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                  ↓
                </kbd>{' '}
                Navigate
              </span>
              <span>
                <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                  Enter
                </kbd>{' '}
                Select
              </span>
              <span>
                <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                  Esc
                </kbd>{' '}
                Close
              </span>
            </div>
            <span className="hidden sm:inline font-medium text-slate-500 dark:text-slate-400">
              JobHub Pro Instant Search
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
