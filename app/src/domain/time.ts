import { format } from 'date-fns';

export const DAY_KEY_FORMAT = 'yyyy-MM-dd';

export function toDayKey(date: Date): string {
  return format(date, DAY_KEY_FORMAT);
}

export function toDayKeyFromIso(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return toDayKey(new Date());
  }

  return toDayKey(date);
}
