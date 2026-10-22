import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Job, CareerNotification, CustomReminder, NotificationUrgency, NotificationType } from '../types/index.js';
import { getRelativeTimeDetails } from '../utils/calendar.js';
import { playInterviewChime, playDeadlineChime, playSuccessChime } from '../utils/sound.js';

interface NotificationContextType {
  notifications: CareerNotification[];
  unreadCount: number;
  urgentCount: number;
  customReminders: CustomReminder[];
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  leadTimeDays: number;
  setLeadTimeDays: (days: number) => void;
  browserNotificationsEnabled: boolean;
  requestBrowserNotificationPermission: () => Promise<boolean>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  snoozeNotification: (id: string, hours: number) => void;
  addCustomReminder: (reminder: { title: string; targetDate: string; note?: string; jobId?: string; company?: string }) => void;
  toggleReminderCompleted: (id: string) => void;
  deleteCustomReminder: (id: string) => void;
  sendTestNotification: () => void;
  playChime: (type?: 'interview' | 'deadline') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEYS = {
  READ_IDS: 'jobhub_read_notifications',
  DISMISSED_IDS: 'jobhub_dismissed_notifications',
  SNOOZED: 'jobhub_snoozed_notifications',
  REMINDERS: 'jobhub_custom_reminders',
  SOUND_ENABLED: 'jobhub_sound_enabled',
  LEAD_TIME_DAYS: 'jobhub_lead_time_days',
  PUSH_REQUESTED: 'jobhub_push_requested',
};

interface NotificationProviderProps {
  children: React.ReactNode;
  jobs: Job[];
}

export function NotificationProvider({ children, jobs }: NotificationProviderProps) {
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.READ_IDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISMISSED_IDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [snoozedMap, setSnoozedMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SNOOZED);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [customReminders, setCustomReminders] = useState<CustomReminder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Initial sample reminder
    return [
      {
        id: 'rem_01',
        title: 'Review System Design STAR framework for Stripe',
        company: 'Stripe',
        note: 'Prepare distributed transaction notes and idempotency architecture sketches.',
        targetDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [leadTimeDays, setLeadTimeDaysState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEAD_TIME_DAYS);
      return saved ? Number(saved) : 7;
    } catch {
      return 7;
    }
  });

  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState<boolean>(false);

  // Sync state with local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.READ_IDS, JSON.stringify(readIds));
    } catch {}
  }, [readIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DISMISSED_IDS, JSON.stringify(dismissedIds));
    } catch {}
  }, [dismissedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SNOOZED, JSON.stringify(snoozedMap));
    } catch {}
  }, [snoozedMap]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(customReminders));
    } catch {}
  }, [customReminders]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, JSON.stringify(enabled));
    } catch {}
    if (enabled) {
      playSuccessChime();
    }
  };

  const setLeadTimeDays = (days: number) => {
    setLeadTimeDaysState(days);
    try {
      localStorage.setItem(STORAGE_KEYS.LEAD_TIME_DAYS, String(days));
    } catch {}
  };

  const playChime = useCallback(
    (type?: 'interview' | 'deadline') => {
      if (!soundEnabled) return;
      if (type === 'interview') {
        playInterviewChime();
      } else {
        playDeadlineChime();
      }
    },
    [soundEnabled]
  );

  const requestBrowserNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const result = await Notification.requestPermission();
      const granted = result === 'granted';
      setBrowserNotificationsEnabled(granted);
      if (granted) {
        new Notification('JobHub Pro Notifications Active', {
          body: 'You will receive timely alerts for upcoming interviews and application deadlines.',
          icon: '/favicon.ico',
        });
        if (soundEnabled) playSuccessChime();
      }
      return granted;
    } catch (err) {
      console.warn('Browser notification permission error:', err);
      return false;
    }
  };

  // Build notifications from active jobs & custom reminders
  const notifications: CareerNotification[] = useMemo(() => {
    const list: CareerNotification[] = [];
    const now = Date.now();

    // 1. Process Jobs
    jobs.forEach((job) => {
      // 1A. Interview Scheduled Date
      if (job.interviewDate) {
        const id = `notif_interview_${job.id}`;
        const snoozedUntil = snoozedMap[id];
        const isSnoozed = snoozedUntil && new Date(snoozedUntil).getTime() > now;

        if (!dismissedIds.includes(id) && !isSnoozed) {
          const timing = getRelativeTimeDetails(job.interviewDate);
          let urgency: NotificationUrgency = 'low';

          if (timing.isPast) {
            urgency = 'critical';
          } else if (timing.isToday) {
            urgency = 'critical';
          } else if (timing.isTomorrow) {
            urgency = 'high';
          } else if (timing.days <= 3) {
            urgency = 'high';
          } else if (timing.days <= leadTimeDays) {
            urgency = 'medium';
          }

          // Include if within lead time or today/past
          if (timing.isPast || timing.days <= leadTimeDays) {
            list.push({
              id,
              type: 'interview',
              title: `${job.company} — ${job.interviewRound || 'Interview Scheduled'}`,
              message: `Interview for ${job.title} is coming up. Review key metrics and practice STAR questions in Interview Coach.`,
              jobId: job.id,
              company: job.company,
              jobTitle: job.title,
              targetDate: job.interviewDate,
              urgency,
              isRead: readIds.includes(id),
              interviewRound: job.interviewRound || 'Interview Round',
              daysRemaining: timing.days,
              hoursRemaining: timing.hours,
              formattedRemaining: timing.formatted,
              contactPerson: job.contactPerson,
              contactEmail: job.contactEmail,
            });
          }
        }
      }

      // 1B. Application Deadline
      if (job.deadline && job.status !== 'rejected' && job.status !== 'archived') {
        const id = `notif_deadline_${job.id}`;
        const snoozedUntil = snoozedMap[id];
        const isSnoozed = snoozedUntil && new Date(snoozedUntil).getTime() > now;

        if (!dismissedIds.includes(id) && !isSnoozed) {
          const timing = getRelativeTimeDetails(job.deadline);
          let urgency: NotificationUrgency = 'low';

          if (timing.isPast) {
            urgency = 'critical';
          } else if (timing.isToday) {
            urgency = 'critical';
          } else if (timing.isTomorrow) {
            urgency = 'high';
          } else if (timing.days <= 2) {
            urgency = 'high';
          } else if (timing.days <= leadTimeDays) {
            urgency = 'medium';
          }

          if (timing.days <= leadTimeDays || timing.isPast) {
            list.push({
              id,
              type: 'deadline',
              title: `Application Deadline: ${job.company}`,
              message: `The deadline for ${job.title} is approaching (${timing.formatted}). Ensure your ATS match score is 85%+ and submit.`,
              jobId: job.id,
              company: job.company,
              jobTitle: job.title,
              targetDate: job.deadline,
              urgency,
              isRead: readIds.includes(id),
              daysRemaining: timing.days,
              hoursRemaining: timing.hours,
              formattedRemaining: timing.formatted,
              actionUrl: job.directUrl,
              contactPerson: job.contactPerson,
              contactEmail: job.contactEmail,
            });
          }
        }
      }

      // 1C. Offer Details Decision Deadline
      if (job.offerDetails?.deadline && job.status === 'offer') {
        const id = `notif_offer_${job.id}`;
        const snoozedUntil = snoozedMap[id];
        const isSnoozed = snoozedUntil && new Date(snoozedUntil).getTime() > now;

        if (!dismissedIds.includes(id) && !isSnoozed) {
          const timing = getRelativeTimeDetails(job.offerDetails.deadline);
          let urgency: NotificationUrgency = 'high';
          if (timing.isToday || timing.isPast) urgency = 'critical';

          list.push({
            id,
            type: 'offer_deadline',
            title: `Offer Decision Expiration: ${job.company}`,
            message: `Offer window for ${job.title} ends ${timing.formatted}. Base salary: ${job.offerDetails.baseSalary || 'Competitive'}.`,
            jobId: job.id,
            company: job.company,
            jobTitle: job.title,
            targetDate: job.offerDetails.deadline,
            urgency,
            isRead: readIds.includes(id),
            daysRemaining: timing.days,
            hoursRemaining: timing.hours,
            formattedRemaining: timing.formatted,
          });
        }
      }

      // 1D. Follow-Up Reminder
      if (job.followUpDate) {
        const id = `notif_followup_${job.id}`;
        const snoozedUntil = snoozedMap[id];
        const isSnoozed = snoozedUntil && new Date(snoozedUntil).getTime() > now;

        if (!dismissedIds.includes(id) && !isSnoozed) {
          const timing = getRelativeTimeDetails(job.followUpDate);
          if (timing.days <= 2 || timing.isPast) {
            list.push({
              id,
              type: 'follow_up',
              title: `Follow-Up Due: ${job.company}`,
              message: `Time to check in with ${job.contactPerson || job.company} regarding your application or interview feedback.`,
              jobId: job.id,
              company: job.company,
              jobTitle: job.title,
              targetDate: job.followUpDate,
              urgency: timing.isToday || timing.isPast ? 'high' : 'medium',
              isRead: readIds.includes(id),
              daysRemaining: timing.days,
              hoursRemaining: timing.hours,
              formattedRemaining: timing.formatted,
              contactEmail: job.contactEmail,
            });
          }
        }
      }
    });

    // 2. Process Custom Reminders
    customReminders.forEach((rem) => {
      if (!rem.isCompleted) {
        const id = `notif_custom_${rem.id}`;
        const snoozedUntil = snoozedMap[id];
        const isSnoozed = snoozedUntil && new Date(snoozedUntil).getTime() > now;

        if (!dismissedIds.includes(id) && !isSnoozed) {
          const timing = getRelativeTimeDetails(rem.targetDate);
          let urgency: NotificationUrgency = 'medium';
          if (timing.isPast || timing.isToday) urgency = 'high';

          list.push({
            id,
            type: 'custom_reminder',
            title: rem.title,
            message: rem.note || `Custom career milestone scheduled for ${timing.formatted}.`,
            jobId: rem.jobId,
            company: rem.company,
            targetDate: rem.targetDate,
            urgency,
            isRead: readIds.includes(id),
            daysRemaining: timing.days,
            hoursRemaining: timing.hours,
            formattedRemaining: timing.formatted,
          });
        }
      }
    });

    // Sort notifications:
    // Urgency rank: critical > high > medium > low
    // Then by targetDate ascending (soonest first)
    const urgencyOrder: Record<NotificationUrgency, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    return list.sort((a, b) => {
      const uDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      if (uDiff !== 0) return uDiff;
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    });
  }, [jobs, customReminders, readIds, dismissedIds, snoozedMap, leadTimeDays]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const urgentCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead && (n.urgency === 'critical' || n.urgency === 'high')).length;
  }, [notifications]);

  const markAsRead = (id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds((prev) => Array.from(new Set([...prev, ...allIds])));
    if (soundEnabled) playSuccessChime();
  };

  const dismissNotification = (id: string) => {
    setDismissedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const snoozeNotification = (id: string, hours: number) => {
    const snoozeUntil = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    setSnoozedMap((prev) => ({ ...prev, [id]: snoozeUntil }));
    markAsRead(id);
    if (soundEnabled) playSuccessChime();
  };

  const addCustomReminder = ({
    title,
    targetDate,
    note,
    jobId,
    company,
  }: {
    title: string;
    targetDate: string;
    note?: string;
    jobId?: string;
    company?: string;
  }) => {
    const newRem: CustomReminder = {
      id: `rem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      targetDate,
      note,
      jobId,
      company,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    setCustomReminders((prev) => [newRem, ...prev]);
    if (soundEnabled) playSuccessChime();
  };

  const toggleReminderCompleted = (id: string) => {
    setCustomReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r))
    );
    if (soundEnabled) playSuccessChime();
  };

  const deleteCustomReminder = (id: string) => {
    setCustomReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const sendTestNotification = () => {
    if (soundEnabled) {
      playInterviewChime();
    }
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('🔔 Interview Alert Test', {
        body: 'System Design Round with Stripe tomorrow at 2:00 PM PST. Interview Coach STAR answers ready!',
        icon: '/favicon.ico',
      });
    }
  };

  return (
    <NotificationContext.Provider
      value={{
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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
