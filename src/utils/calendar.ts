/**
 * Calendar helpers for exporting scheduled interviews and job application deadlines
 * to Google Calendar or standard .ics (Apple Calendar, Outlook, etc.)
 */

export function formatEventDateForICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function downloadICSFile(params: {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  filename?: string;
}) {
  const { title, description, location = 'Remote / Video Conference', startDate, endDate, filename } = params;

  // Default end date is 1 hour after start
  const end = endDate || new Date(startDate.getTime() + 60 * 60 * 1000);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JobHub Pro//Career Suite//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@jobhubpro.internal`,
    `DTSTAMP:${formatEventDateForICS(new Date())}`,
    `DTSTART:${formatEventDateForICS(startDate)}`,
    `DTEND:${formatEventDateForICS(end)}`,
    `SUMMARY:${title.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n').replace(/,/g, '\\,')}`,
    `LOCATION:${location.replace(/,/g, '\\,')}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${title.replace(/,/g, '\\,')}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename || 'jobhub_event'}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getGoogleCalendarUrl(params: {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
}): string {
  const { title, description, location = 'Remote / Video Conference', startDate, endDate } = params;
  const end = endDate || new Date(startDate.getTime() + 60 * 60 * 1000);

  const startStr = formatEventDateForICS(startDate);
  const endStr = formatEventDateForICS(end);

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', title);
  url.searchParams.set('dates', `${startStr}/${endStr}`);
  url.searchParams.set('details', description);
  url.searchParams.set('location', location);

  return url.toString();
}

/**
 * Returns human-readable relative timing with exact hour/day breakdowns
 */
export function getRelativeTimeDetails(targetDateStr: string): {
  days: number;
  hours: number;
  isPast: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  formatted: string;
} {
  const target = new Date(targetDateStr);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const isPast = diffMs < 0;

  const absDiff = Math.abs(diffMs);
  const hours = Math.round(absDiff / (1000 * 60 * 60));
  const days = Math.round(absDiff / (1000 * 60 * 60 * 24));

  // Determine today/tomorrow in local time
  const todayDate = now.toDateString();
  const targetDateOnly = target.toDateString();
  const isToday = todayDate === targetDateOnly;

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = tomorrow.toDateString() === targetDateOnly;

  const timeFormatted = target.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  let formatted = '';
  if (isPast) {
    if (hours < 1) formatted = 'Just now';
    else if (hours < 24) formatted = `${hours}h overdue`;
    else if (days === 1) formatted = '1 day overdue';
    else formatted = `${days} days overdue`;
  } else {
    if (isToday) {
      if (hours <= 1) formatted = `Today in < 1h (${timeFormatted})`;
      else formatted = `Today at ${timeFormatted} (in ${hours}h)`;
    } else if (isTomorrow) {
      formatted = `Tomorrow at ${timeFormatted}`;
    } else if (days <= 7) {
      const weekday = target.toLocaleDateString([], { weekday: 'short' });
      formatted = `${weekday} in ${days} days (${timeFormatted})`;
    } else {
      formatted = target.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  return {
    days: isPast ? -days : days,
    hours: isPast ? -hours : hours,
    isPast,
    isToday,
    isTomorrow,
    formatted,
  };
}
