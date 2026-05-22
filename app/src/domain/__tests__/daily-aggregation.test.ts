import { aggregateDay } from '../daily-aggregation';
import { LogEntry } from '../log-entry';

const makeLog = (
  id: string,
  iso: string,
  overrides: Partial<LogEntry> = {},
): LogEntry => ({
  id,
  timestampIso: iso,
  dayKey: '2026-05-10',
  editedAt: null,
  deletedAt: null,
  ...overrides,
});

describe('aggregateDay', () => {
  it('counts active logs and returns the latest active timestamp', () => {
    const logs: LogEntry[] = [
      makeLog('a', '2026-05-10T09:00:00.000Z'),
      makeLog('b', '2026-05-10T10:00:00.000Z'),
      makeLog('c', '2026-05-10T11:00:00.000Z', {
        deletedAt: '2026-05-10T11:05:00.000Z',
      }),
    ];

    const result = aggregateDay(logs, 5);

    expect(result.tapCount).toBe(2);
    expect(result.estimatedLossMinutes).toBe(10);
    expect(result.lastLogIso).toBe('2026-05-10T10:00:00.000Z');
  });
});
