import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext.js';
import { Job } from '../../types/index.js';
import { ActiveTab } from '../Navbar.js';
import { getGoogleCalendarUrl } from '../../utils/calendar.js';
import {
  Sparkles,
  Clock,
  Calendar,
  AlertTriangle,
  Mic,
  Target,
  ExternalLink,
  X,
  ChevronRight,
  Building2,
} from 'lucide-react';

interface UpcomingAlertBannerProps {
  jobs: Job[];
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectJobForInterview: (job: Job) => void;
  onSelectJobForATS: (job: Job) => void;
}

export function UpcomingAlertBanner({
  jobs,
  onNavigateTab,
  onSelectJobForInterview,
  onSelectJobForATS,
}: UpcomingAlertBannerProps) {
  const { notifications, markAsRead } = useNotifications();
  const [dismissedBannerIds, setDismissedBannerIds] = useState<string[]>([]);

  // Find the single most urgent imminent notification (critical or high, within 48 hours)
  const urgentNotice = notifications.find((n) => {
    if (dismissedBannerIds.includes(n.id)) return false;
    // Highlight if within 48 hours or today
    return (
      (n.type === 'interview' || n.type === 'deadline' || n.type === 'offer_deadline') &&
      (n.urgency === 'critical' || n.urgency === 'high')
    );
  });

  if (!urgentNotice) return null;

  const matchedJob = urgentNotice.jobId ? jobs.find((j) => j.id === urgentNotice.jobId) : undefined;

  const handleDismiss = () => {
    setDismissedBannerIds((prev) => [...prev, urgentNotice.id]);
    markAsRead(urgentNotice.id);
  };

  const isInterview = urgentNotice.type === 'interview';

  return (
    <div className="no-print mb-6 rounded-2xl border transition-all animate-in slide-in-from-top-3 duration-200 overflow-hidden shadow-sm bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-indigo-500/5 dark:from-indigo-950/40 dark:via-sky-950/30 dark:to-slate-900/40 border-indigo-200/80 dark:border-indigo-800/60 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Icon & Details */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isInterview
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                : 'bg-amber-500 text-white border-amber-400 shadow-sm shadow-amber-500/30'
            }`}
          >
            {isInterview ? <Clock className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5" />}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  urgentNotice.urgency === 'critical'
                    ? 'bg-rose-500 text-white font-extrabold'
                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-bold'
                }`}
              >
                {isInterview ? '⚡ Upcoming Interview Alert' : '⚠️ Application Deadline Approaching'}
              </span>
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 font-mono">
                {urgentNotice.formattedRemaining}
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
              <span>{urgentNotice.title}</span>
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug line-clamp-1">
              {urgentNotice.message}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {isInterview && matchedJob && (
            <button
              onClick={() => {
                onSelectJobForInterview(matchedJob);
                markAsRead(urgentNotice.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer shadow-sm shadow-indigo-600/20"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Prep STAR Questions</span>
            </button>
          )}

          {!isInterview && matchedJob && (
            <button
              onClick={() => {
                onSelectJobForATS(matchedJob);
                markAsRead(urgentNotice.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer shadow-sm shadow-indigo-600/20"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Optimize Resume ATS</span>
            </button>
          )}

          <button
            onClick={() => {
              const start = new Date(urgentNotice.targetDate);
              const url = getGoogleCalendarUrl({
                title: urgentNotice.title,
                description: urgentNotice.message,
                startDate: start,
              });
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
            title="Add to Google Calendar"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden md:inline">Calendar</span>
          </button>

          <button
            onClick={handleDismiss}
            title="Dismiss this alert"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
