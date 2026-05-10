import { format, isToday, isYesterday, parseISO } from 'date-fns';

type LabelVariant = 'short' | 'long';

export function formatDayLabel(dayKey: string, variant: LabelVariant = 'short'): string {
  const date = parseISO(`${dayKey}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dayKey;
  }

  if (isToday(date)) {
    return 'today';
  }

  if (isYesterday(date)) {
    return 'yesterday';
  }

  return variant === 'long' ? format(date, 'EEEE, MMM d') : format(date, 'EEE, MMM d');
}
