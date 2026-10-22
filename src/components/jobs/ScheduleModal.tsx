import React, { useState, useEffect } from 'react';
import { Job } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { getGoogleCalendarUrl, downloadICSFile } from '../../utils/calendar.js';
import {
  Calendar,
  Clock,
  Building2,
  X,
  Sparkles,
  Check,
  CalendarPlus,
  Download,
  ExternalLink,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  onJobUpdated: (updated: Job) => void;
}

const COMMON_ROUNDS = [
  'Recruiter Screen (30 min)',
  'Technical Screen (Coding / DSA)',
  'System Design Round',
  'Hiring Manager 1:1',
  'Behavioral & STAR Leadership',
  'Executive Final Onsite',
  'Take-Home Assignment Review',
];

export function ScheduleModal({ isOpen, onClose, job, onJobUpdated }: ScheduleModalProps) {
  const { showToast } = useToast();
  const { playChime } = useNotifications();

  // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
  const toLocalDatetime = (isoStr?: string) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  const [interviewDate, setInterviewDate] = useState('');
  const [interviewRound, setInterviewRound] = useState('');
  const [deadline, setDeadline] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (job) {
      setInterviewDate(toLocalDatetime(job.interviewDate));
      setInterviewRound(job.interviewRound || 'System Design Round');
      setDeadline(toLocalDatetime(job.deadline));
      setFollowUpDate(toLocalDatetime(job.followUpDate));
      setNotes('');
    }
  }, [job]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updated = await api.scheduleJob(job.id, {
        interviewDate: interviewDate ? new Date(interviewDate).toISOString() : undefined,
        interviewRound: interviewRound || undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        followUpDate: followUpDate ? new Date(followUpDate).toISOString() : undefined,
        notes: notes.trim() ? notes.trim() : undefined,
      });

      onJobUpdated(updated);
      playChime('interview');
      showToast(`Schedule saved for ${job.company}!`, 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to update schedule', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadICS = () => {
    if (!interviewDate) {
      showToast('Please set an interview date first', 'error');
      return;
    }
    const start = new Date(interviewDate);
    downloadICSFile({
      title: `${job.company} — ${interviewRound || 'Interview'}`,
      description: `Interview for ${job.title} at ${job.company}.\nNotes: ${notes || job.notes || 'Interview prep with JobHub Pro'}\nRecruiter: ${job.contactPerson || 'N/A'}`,
      startDate: start,
      filename: `interview_${job.company.toLowerCase().replace(/\s+/g, '_')}`,
    });
    showToast('Downloaded .ics calendar invite', 'info');
  };

  const handleGoogleCalendar = () => {
    if (!interviewDate) {
      showToast('Please set an interview date first', 'error');
      return;
    }
    const start = new Date(interviewDate);
    const url = getGoogleCalendarUrl({
      title: `${job.company} — ${interviewRound || 'Interview'}`,
      description: `Interview for ${job.title} at ${job.company}.\nNotes: ${notes || job.notes || 'Interview prep with JobHub Pro'}\nRecruiter: ${job.contactPerson || 'N/A'}`,
      startDate: start,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
                <span>Schedule Interview & Deadlines</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {job.title} at <strong className="text-slate-800 dark:text-slate-200">{job.company}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Interview Scheduled Date & Time */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Interview Scheduled Date & Time</span>
              </label>
              {interviewDate && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Alert Active
                </span>
              )}
            </div>

            <input
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-sans cursor-pointer text-xs"
            />

            {/* Quick Round Selector */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Interview Round / Stage Name
              </label>
              <input
                type="text"
                placeholder="e.g. System Design Round (Distributed Platforms)"
                value={interviewRound}
                onChange={(e) => setInterviewRound(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
              />

              {/* Suggestions */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COMMON_ROUNDS.slice(0, 4).map((round) => (
                  <button
                    key={round}
                    type="button"
                    onClick={() => setInterviewRound(round)}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    + {round.split('(')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Quick Exports if date is set */}
            {interviewDate && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGoogleCalendar}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Google Calendar</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadICS}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-medium cursor-pointer transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .ICS (Apple/Outlook)</span>
                </button>
              </div>
            )}
          </div>

          {/* Application Deadline */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Job Application Deadline</span>
              </label>
              {deadline && (
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  Deadline Tracked
                </span>
              )}
            </div>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-sans cursor-pointer text-xs"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              You will be alerted 7, 3, 2, and 1 days before this deadline so you can submit your application in time.
            </p>
          </div>

          {/* Follow-up / Recruiter Check-in Date */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
              <Building2 className="w-3.5 h-3.5 text-sky-500" />
              <span>Follow-up / Recruiter Touchpoint Date (Optional)</span>
            </label>
            <input
              type="datetime-local"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-sans cursor-pointer text-xs"
            />
          </div>

          {/* Prep Notes */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Add Log or Prep Note (Appended to Job Notes)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Focus on distributed transactions and Redis idempotency locks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save & Activate Alerts</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
