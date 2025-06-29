/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export interface CalendarEvent {
  summary?: string;
  location?: string;
  description?: string;
  start: string; // ISO-like string 'YYYY-MM-DDTHH:mm'
  end: string;   // same format
  timezone?: string; // IANA timezone name
  uid?: string;
  alarmMinutes?: number; // minutes before start
}

const sanitize = (value: string): string => value.replace(/\n/g, "\\n");

const formatDate = (isoLocal: string, tz: string): string => {
  const date = new Date(isoLocal);
  if (tz && tz !== 'UTC') {
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
    const offsetMs = tzDate.getTime() - date.getTime();
    return new Date(date.getTime() - offsetMs)
      .toISOString()
      .replace(/[-:]|\.\d{3}/g, '');
  }
  return date.toISOString().replace(/[-:]|\.\d{3}/g, '');
};

export const generateICalEvent = (evt: CalendarEvent): string => {
  if (!evt.start || !evt.end) throw new Error('start and end are required');
  const lines = ['BEGIN:VEVENT'];
  if (evt.summary) lines.push(`SUMMARY:${sanitize(evt.summary)}`);
  if (evt.location) lines.push(`LOCATION:${sanitize(evt.location)}`);
  if (evt.description) lines.push(`DESCRIPTION:${sanitize(evt.description)}`);
  lines.push(`DTSTART:${formatDate(evt.start, evt.timezone || 'UTC')}`);
  lines.push(`DTEND:${formatDate(evt.end, evt.timezone || 'UTC')}`);
  lines.push(`UID:${evt.uid || (typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString())}`);
  if (evt.alarmMinutes) {
    lines.push('BEGIN:VALARM');
    lines.push(`TRIGGER:-PT${evt.alarmMinutes}M`);
    lines.push('ACTION:DISPLAY');
    lines.push('DESCRIPTION:Reminder');
    lines.push('END:VALARM');
  }
  lines.push('END:VEVENT');
  return lines.join('\n');
};
