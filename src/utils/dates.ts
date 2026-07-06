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

export interface DayFilterOption {
  /** Local (America/New_York) calendar day key, e.g. "2026-07-01". */
  key: string;
  /** Chip label: "Today", "Tomorrow", then the weekday name (e.g. "Fri"). */
  label: string;
}

/** Local calendar-day key (yyyy-MM-dd) for an ISO timestamp, in campus time. */
export function getLocalDayKey(iso: string): string {
  return formatInTimeZone(new Date(iso), TIMEZONE, 'yyyy-MM-dd');
}

/**
 * Builds the day-filter chips: Today, Tomorrow, then the next 5 days by name
 * (7 days total), each keyed by its America/New_York calendar day.
 */
export function getDayFilterOptions(count = 7): DayFilterOption[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now + i * dayMs);
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : formatInTimeZone(date, TIMEZONE, 'EEE');
    return { key: formatInTimeZone(date, TIMEZONE, 'yyyy-MM-dd'), label };
  });
}

/** True when the event's start time falls on the given local day key. */
export function isSameLocalDay(iso: string, dayKey: string): boolean {
  return getLocalDayKey(iso) === dayKey;
}

export function getReminderDate(startTime: string, offsetMinutes: number): Date | null {
  if (offsetMinutes <= 0) return null;
  const start = new Date(startTime);
  const reminder = new Date(start.getTime() - offsetMinutes * 60 * 1000);
  if (reminder <= new Date()) return null;
  return reminder;
}
