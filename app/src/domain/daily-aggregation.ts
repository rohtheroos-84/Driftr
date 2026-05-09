import { LogEntry } from './log-entry';

type DailyAggregation = {
  tapCount: number;
  estimatedLossMinutes: number;
  lastLogIso: string | null;
};

type HourlyHistogram = {
  hours: number[];
  maxCount: number;
};

export function aggregateDay(
  logs: LogEntry[],
  minutesPerTap: number,
): DailyAggregation {
  const activeLogs = logs.filter((log) => !log.deletedAt);
  const tapCount = activeLogs.length;
  const estimatedLossMinutes = tapCount * minutesPerTap;

  const lastLogIso = activeLogs.reduce<string | null>((latest, log) => {
    if (!latest || log.timestampIso > latest) {
      return log.timestampIso;
    }

    return latest;
  }, null);

  return {
    tapCount,
    estimatedLossMinutes,
    lastLogIso,
  };
}

export function getHourlyHistogram(logs: LogEntry[]): HourlyHistogram {
  const activeLogs = logs.filter((log) => !log.deletedAt);
  const hours = Array.from({ length: 24 }, () => 0);

  activeLogs.forEach((log) => {
    const hour = new Date(log.timestampIso).getHours();
    hours[hour] += 1;
  });

  const maxCount = hours.reduce((max, count) => (count > max ? count : max), 0);

  return {
    hours,
    maxCount,
  };
}
