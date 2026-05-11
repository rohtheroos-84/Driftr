import { format, subDays } from 'date-fns';

import { aggregateDay, getHourlyHistogram } from './daily-aggregation';
import { LogEntry } from './log-entry';
import { toDayKey } from './time';

type TopHourSummary = {
  label: string;
  count: number;
  share: number;
};

type PatternComparison = {
  todayCount: number;
  todayLossMinutes: number;
  yesterdayCount: number;
  yesterdayLossMinutes: number;
  deltaCount: number;
  deltaLossMinutes: number;
  topHour: TopHourSummary | null;
};

const groupByDayKey = (logs: LogEntry[]) => {
  const map = new Map<string, LogEntry[]>();

  logs.forEach((log) => {
    const entries = map.get(log.dayKey) ?? [];
    entries.push(log);
    map.set(log.dayKey, entries);
  });

  return map;
};

const formatHourLabel = (hour: number, base: Date) => {
  const stamp = new Date(base);
  stamp.setHours(hour, 0, 0, 0);
  return format(stamp, 'h a');
};

export function buildPatternComparison(
  logs: LogEntry[],
  minutesPerTap: number,
  now: Date = new Date(),
): PatternComparison {
  const activeLogs = logs.filter((log) => !log.deletedAt);
  const grouped = groupByDayKey(activeLogs);

  const todayKey = toDayKey(now);
  const yesterdayKey = toDayKey(subDays(now, 1));

  const todayAggregation = aggregateDay(grouped.get(todayKey) ?? [], minutesPerTap);
  const yesterdayAggregation = aggregateDay(grouped.get(yesterdayKey) ?? [], minutesPerTap);

  const deltaCount = todayAggregation.tapCount - yesterdayAggregation.tapCount;
  const deltaLossMinutes =
    todayAggregation.estimatedLossMinutes - yesterdayAggregation.estimatedLossMinutes;

  const last7Keys = new Set(
    Array.from({ length: 7 }, (_, index) => toDayKey(subDays(now, index))),
  );
  const last7Logs = activeLogs.filter((log) => last7Keys.has(log.dayKey));
  const histogram = getHourlyHistogram(last7Logs);
  const total = histogram.hours.reduce((sum, count) => sum + count, 0);

  let topHour: TopHourSummary | null = null;

  if (histogram.maxCount > 0) {
    const hourIndex = histogram.hours.findIndex((count) => count === histogram.maxCount);

    if (hourIndex >= 0) {
      topHour = {
        label: formatHourLabel(hourIndex, now),
        count: histogram.maxCount,
        share: total > 0 ? histogram.maxCount / total : 0,
      };
    }
  }

  return {
    todayCount: todayAggregation.tapCount,
    todayLossMinutes: todayAggregation.estimatedLossMinutes,
    yesterdayCount: yesterdayAggregation.tapCount,
    yesterdayLossMinutes: yesterdayAggregation.estimatedLossMinutes,
    deltaCount,
    deltaLossMinutes,
    topHour,
  };
}
