import { format, isToday, isTomorrow } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'America/New_York';

export function formatEventTimeRange(startTime: string, endTime: string): string {
  const start = toZonedTime(new Date(startTime), TIMEZONE);
  const end = toZonedTime(new Date(endTime), TIMEZONE);

  const dayLabel = isToday(start)
    ? 'Today'
    : isTomorrow(start)
      ? 'Tomorrow'
      : formatInTimeZone(start, TIMEZONE, 'EEE, MMM d');

  const startStr = format(start, 'h:mm a');
  const endStr = format(end, 'h:mm a');

  return `${dayLabel} · ${startStr} – ${endStr}`;
}

export function formatEventTimeShort(startTime: string, endTime: string): string {
  const start = toZonedTime(new Date(startTime), TIMEZONE);
  const end = toZonedTime(new Date(endTime), TIMEZONE);
  return `${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`;
}

export function formatLastUpdated(iso: string): string {
  const date = new Date(iso);
  return formatInTimeZone(date, TIMEZONE, "MMM d, h:mm a");
}

export function getReminderDate(startTime: string, offsetMinutes: number): Date | null {
  if (offsetMinutes <= 0) return null;
  const start = new Date(startTime);
  const reminder = new Date(start.getTime() - offsetMinutes * 60 * 1000);
  if (reminder <= new Date()) return null;
  return reminder;
}
