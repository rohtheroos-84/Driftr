import { differenceInMinutes, format } from 'date-fns';

import { LogEntry } from './log-entry';

type Insight = {
  id: 'none' | 'low' | 'burst' | 'peak' | 'scattered' | 'steady';
  title: string;
  detail: string;
};

const MIN_TAPS_FOR_PATTERNS = 3;
const MIN_TAPS_FOR_DISTRIBUTION = 4;
const BURST_WINDOW_MINUTES = 30;
const PEAK_SHARE_THRESHOLD = 0.4;
const SCATTERED_MAX_SHARE = 0.25;

const sortByTime = (logs: LogEntry[]) =>
  [...logs].sort((a, b) => a.timestampIso.localeCompare(b.timestampIso));

const getHourLabel = (hour: number) => {
  const base = new Date();
  base.setHours(hour, 0, 0, 0);
  return format(base, 'h a');
};

const findBurstWindow = (logs: LogEntry[]) => {
  if (logs.length < MIN_TAPS_FOR_PATTERNS) {
    return null;
  }

  const sorted = sortByTime(logs);

  for (let start = 0; start < sorted.length - 2; start += 1) {
    for (let end = start + 2; end < sorted.length; end += 1) {
      const minutes = differenceInMinutes(
        new Date(sorted[end].timestampIso),
        new Date(sorted[start].timestampIso),
      );

      if (minutes > BURST_WINDOW_MINUTES) {
        break;
      }

      return {
        startIso: sorted[start].timestampIso,
        endIso: sorted[end].timestampIso,
        count: end - start + 1,
      };
    }
  }

  return null;
};

const getHourDistribution = (logs: LogEntry[]) => {
  const counts = new Map<number, number>();

  logs.forEach((log) => {
    const hour = new Date(log.timestampIso).getHours();
    counts.set(hour, (counts.get(hour) ?? 0) + 1);
  });

  let maxHour = 0;
  let maxCount = 0;

  counts.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count;
      maxHour = hour;
    }
  });

  return {
    maxHour,
    maxCount,
  };
};

export function getDailyInsight(logs: LogEntry[]): Insight {
  const activeLogs = logs.filter((log) => !log.deletedAt);
  const total = activeLogs.length;

  if (total === 0) {
    return {
      id: 'none',
      title: 'no drifts yet',
      detail: 'log a drift to unlock patterns.',
    };
  }

  if (total < MIN_TAPS_FOR_PATTERNS) {
    return {
      id: 'low',
      title: 'too few drifts',
      detail: 'log a few more to surface a pattern.',
    };
  }

  const burst = findBurstWindow(activeLogs);
  if (burst) {
    const startLabel = format(new Date(burst.startIso), 'h:mm a');
    const endLabel = format(new Date(burst.endIso), 'h:mm a');

    return {
      id: 'burst',
      title: 'burst window',
      detail: `${burst.count}+ drifts between ${startLabel} and ${endLabel}.`,
    };
  }

  const distribution = getHourDistribution(activeLogs);
  const peakShare = total > 0 ? distribution.maxCount / total : 0;

  if (total >= MIN_TAPS_FOR_DISTRIBUTION && peakShare >= PEAK_SHARE_THRESHOLD) {
    const percent = Math.round(peakShare * 100);
    const label = getHourLabel(distribution.maxHour);

    return {
      id: 'peak',
      title: 'peak hour',
      detail: `most drifts landed around ${label} (${percent}% of taps).`,
    };
  }

  if (total >= MIN_TAPS_FOR_DISTRIBUTION && peakShare <= SCATTERED_MAX_SHARE) {
    return {
      id: 'scattered',
      title: 'spread out',
      detail: 'drifts were spread across the day with no single hour leading.',
    };
  }

  return {
    id: 'steady',
    title: 'steady rhythm',
    detail: 'drifts were fairly even, with no sharp spikes.',
  };
}
