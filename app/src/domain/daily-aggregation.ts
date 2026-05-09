import { LogEntry } from './log-entry';

type DailyAggregation = {
  tapCount: number;
  estimatedLossMinutes: number;
  lastLogIso: string | null;
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
