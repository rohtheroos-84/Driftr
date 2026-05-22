import { subDays } from 'date-fns';

import { buildPatternComparison } from '../pattern-comparison';
import { LogEntry } from '../log-entry';
import { toDayKey } from '../time';

const makeLog = (
  id: string,
  date: Date,
  dayKey: string,
  overrides: Partial<LogEntry> = {},
): LogEntry => ({
  id,
  timestampIso: date.toISOString(),
  dayKey,
  editedAt: null,
  deletedAt: null,
  ...overrides,
});

describe('buildPatternComparison', () => {
  it('compares today vs yesterday and finds the top hour', () => {
    const now = new Date(2026, 4, 10, 9, 0, 0);
    const todayKey = toDayKey(now);
    const yesterdayKey = toDayKey(subDays(now, 1));

    const logs: LogEntry[] = [
      makeLog('a', now, todayKey),
      makeLog('b', new Date(now.getTime() + 30 * 60 * 1000), todayKey),
      makeLog('c', subDays(now, 1), yesterdayKey),
    ];

    const comparison = buildPatternComparison(logs, 5, now);

    expect(comparison.todayCount).toBe(2);
    expect(comparison.yesterdayCount).toBe(1);
    expect(comparison.deltaCount).toBe(1);
    expect(comparison.todayLossMinutes).toBe(10);
    expect(comparison.yesterdayLossMinutes).toBe(5);
    expect(comparison.topHour?.count).toBe(3);
    expect(comparison.topHour?.share).toBeCloseTo(1);
  });
});
