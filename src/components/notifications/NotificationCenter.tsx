import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext.js';
import { CareerNotification, Job } from '../../types/index.js';
import { ActiveTab } from '../Navbar.js';
import { downloadICSFile, getGoogleCalendarUrl } from '../../utils/calendar.js';
import {
  Bell,
  Calendar,
  Clock,
  Building2,
  Check,
  CheckCheck,
  Volume2,
  VolumeX,
  Settings,
  X,
  ExternalLink,
  Target,
  Mic,
  CalendarPlus,
  AlertTriangle,
  Sparkles,
  Download,
  Plus,
  ArrowRight,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

interface NotificationCenterProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectJobForInterview: (job: Job) => void;
  onSelectJobForATS: (job: Job) => void;
  onOpenScheduleModal: (job: Job) => void;
  jobs: Job[];
}

export function NotificationCenter({
  onNavigateTab,
  onSelectJobForInterview,
  onSelectJobForATS,
  onOpenScheduleModal,
  jobs,
}: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    urgentCount,
    customReminders,
    soundEnabled,
    setSoundEnabled,
    leadTimeDays,
    setLeadTimeDays,
    browserNotificationsEnabled,
    requestBrowserNotificationPermission,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    snoozeNotification,
    addCustomReminder,
    toggleReminderCompleted,
    deleteCustomReminder,
    sendTestNotification,
    playChime,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'interview' | 'deadline' | 'reminder'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);

  // Quick reminder form state
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderJobId, setNewReminderJobId] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderNote, setNewReminderNote] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSettings(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'interview') return n.type === 'interview';
    if (activeFilter === 'deadline') return n.type === 'deadline' || n.type === 'offer_deadline';
    if (activeFilter === 'reminder') return n.type === 'custom_reminder' || n.type === 'follow_up';
    return true;
  });

  const interviewCount = notifications.filter((n) => n.type === 'interview').length;
  const deadlineCount = notifications.filter((n) => n.type === 'deadline' || n.type === 'offer_deadline').length;
  const reminderCount = notifications.filter((n) => n.type === 'custom_reminder' || n.type === 'follow_up').length;

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim() || !newReminderDate) return;

    const matchedJob = jobs.find((j) => j.id === newReminderJobId);

    addCustomReminder({
      title: newReminderTitle.trim(),
      targetDate: new Date(newReminderDate).toISOString(),
      note: newReminderNote.trim() || undefined,
      jobId: newReminderJobId || undefined,
      company: matchedJob ? matchedJob.company : undefined,
    });

    setNewReminderTitle('');
    setNewReminderDate('');
    setNewReminderNote('');
    setNewReminderJobId('');
    setShowAddReminderModal(false);
  };

  const getUrgencyBadge = (notif: CareerNotification) => {
    if (notif.urgency === 'critical') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          {notif.type === 'interview' ? 'INTERVIEW TODAY' : notif.daysRemaining < 0 ? 'OVERDUE' : 'DUE TODAY'}
        </span>
      );
    }
    if (notif.urgency === 'high') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
          {notif.formattedRemaining.toUpperCase()}
        </span>
      );
    }
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
        {notif.formattedRemaining}
      </span>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowSettings(false);
        }}
        title="Job Application Deadlines & Interview Alerts"
        aria-label="View notifications"
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center text-white ${
              urgentCount > 0
                ? 'bg-rose-600 animate-pulse ring-2 ring-rose-300 dark:ring-rose-950'
                : 'bg-indigo-600'
            }`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 sm:w-[440px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Career Alerts</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      {unreadCount} unread
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Deadlines & interview schedule
                </p>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute alert sounds' : 'Enable audio chimes'}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                title="Notification preferences"
                className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer ${
                  showSettings ? 'bg-slate-200 dark:bg-slate-800 text-indigo-600' : ''
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Settings Drawer (Toggleable) */}
          {showSettings && (
            <div className="p-4 bg-slate-100/80 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-xs space-y-3 animate-in fade-in duration-150">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>Alert Preferences</span>
                <button
                  onClick={sendTestNotification}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  Test Alert Chime
                </button>
              </div>

              {/* Web Push Notification Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Browser Push Notifications
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Receive desktop alerts even when unfocused
                  </div>
                </div>
                <button
                  onClick={requestBrowserNotificationPermission}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                    browserNotificationsEnabled
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {browserNotificationsEnabled ? 'Active' : 'Enable'}
                </button>
              </div>

              {/* Lead Time Selector */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Alert Lead Time
                </span>
                <select
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                  className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-medium text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value={1}>1 Day Before</option>
                  <option value={3}>3 Days Before</option>
                  <option value={7}>1 Week Before</option>
                  <option value={14}>2 Weeks Before</option>
                </select>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center px-4 py-2 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('interview')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeFilter === 'interview'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Interviews ({interviewCount})
            </button>
            <button
              onClick={() => setActiveFilter('deadline')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeFilter === 'deadline'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Deadlines ({deadlineCount})
            </button>
            <button
              onClick={() => setActiveFilter('reminder')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeFilter === 'reminder'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Reminders ({reminderCount})
            </button>

            {/* Quick Add Button */}
            <button
              onClick={() => setShowAddReminderModal(true)}
              title="Add custom reminder"
              className="ml-auto p-1 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/80 p-2 space-y-1">
            {filteredNotifications.map((notif) => {
              const matchedJob = notif.jobId ? jobs.find((j) => j.id === notif.jobId) : undefined;

              return (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-3 rounded-xl transition-all cursor-pointer relative group ${
                    notif.isRead
                      ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-l-3 border-indigo-600 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {/* Top row: Urgency + Type + Dismiss */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getUrgencyBadge(notif)}
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        {notif.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      {/* Snooze 1 day */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          snoozeNotification(notif.id, 24);
                        }}
                        title="Snooze 24 hours"
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-[10px]"
                      >
                        Snooze
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(notif.id);
                        }}
                        title="Dismiss notification"
                        className="p-1 rounded text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Company */}
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                    {notif.title}
                  </div>

                  {/* Message */}
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Target Date Details */}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      {new Date(notif.targetDate).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    {notif.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {notif.company}
                      </span>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div
                    className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* If Interview: Coach CTA */}
                    {notif.type === 'interview' && matchedJob && (
                      <button
                        onClick={() => {
                          onSelectJobForInterview(matchedJob);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold cursor-pointer transition shadow-xs"
                      >
                        <Mic className="w-3 h-3" />
                        <span>Prep STAR Answers</span>
                      </button>
                    )}

                    {/* If Deadline: ATS CTA */}
                    {notif.type === 'deadline' && matchedJob && (
                      <button
                        onClick={() => {
                          onSelectJobForATS(matchedJob);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold cursor-pointer transition shadow-xs"
                      >
                        <Target className="w-3 h-3" />
                        <span>ATS 85%+ Check</span>
                      </button>
                    )}

                    {/* Reschedule / Edit Schedule */}
                    {matchedJob && (
                      <button
                        onClick={() => {
                          onOpenScheduleModal(matchedJob);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-medium cursor-pointer transition"
                      >
                        <CalendarPlus className="w-3 h-3" />
                        <span>Reschedule</span>
                      </button>
                    )}

                    {/* Export to Calendar */}
                    <button
                      onClick={() => {
                        const start = new Date(notif.targetDate);
                        const url = getGoogleCalendarUrl({
                          title: notif.title,
                          description: notif.message,
                          startDate: start,
                        });
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                      title="Add to Google Calendar"
                      className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ml-auto"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        const start = new Date(notif.targetDate);
                        downloadICSFile({
                          title: notif.title,
                          description: notif.message,
                          startDate: start,
                          filename: `event_${notif.company || 'career'}_${Date.now()}`,
                        });
                      }}
                      title="Download .ICS for Apple/Outlook"
                      className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredNotifications.length === 0 && (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    All Caught Up!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    No urgent application deadlines or interview alerts in this view.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddReminderModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Set Custom Reminder</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                onNavigateTab('jobs');
                setIsOpen(false);
              }}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Job Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Auto-syncs with job status
            </span>
          </div>
        </div>
      )}

      {/* Quick Add Custom Reminder Modal */}
      {showAddReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Create Career Reminder</span>
              </h3>
              <button
                onClick={() => setShowAddReminderModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Reminder Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow up with Stripe recruiter Sarah Chen"
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Associate with Job (Optional)
                </label>
                <select
                  value={newReminderJobId}
                  onChange={(e) => setNewReminderJobId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">None / General Reminder</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.company} — {j.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Alert Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newReminderDate}
                  onChange={(e) => setNewReminderDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Notes / Agenda (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context or talking points..."
                  value={newReminderNote}
                  onChange={(e) => setNewReminderNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddReminderModal(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
