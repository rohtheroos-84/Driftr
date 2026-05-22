import { getDailyInsight } from '../insight-engine';
import { LogEntry } from '../log-entry';

const makeLogAt = (
  id: string,
  date: Date,
  overrides: Partial<LogEntry> = {},
): LogEntry => ({
  id,
  timestampIso: date.toISOString(),
  dayKey: '2026-05-10',
  editedAt: null,
  deletedAt: null,
  ...overrides,
});

const base = new Date(Date.UTC(2026, 4, 10, 9, 0, 0));

const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60 * 1000);

const setHour = (date: Date, hour: number, minute = 0) => {
  const next = new Date(date.getTime());
  next.setUTCHours(hour, minute, 0, 0);
  return next;
};

describe('getDailyInsight', () => {
  it('returns none when no logs', () => {
    expect(getDailyInsight([]).id).toBe('none');
  });

  it('returns low when taps are under the threshold', () => {
    const logs = [
      makeLogAt('a', base),
      makeLogAt('b', addMinutes(base, 45)),
    ];

    expect(getDailyInsight(logs).id).toBe('low');
  });

  it('returns burst when 3+ logs fall within 30 minutes', () => {
    const logs = [
      makeLogAt('a', base),
      makeLogAt('b', addMinutes(base, 10)),
      makeLogAt('c', addMinutes(base, 20)),
    ];

    expect(getDailyInsight(logs).id).toBe('burst');
  });

  it('returns peak when one hour holds at least 40% of taps', () => {
    const logs = [
      makeLogAt('a', setHour(base, 10, 0)),
      makeLogAt('b', setHour(base, 10, 40)),
      makeLogAt('c', setHour(base, 10, 55)),
      makeLogAt('d', setHour(base, 15, 10)),
    ];

    expect(getDailyInsight(logs).id).toBe('peak');
  });

  it('returns scattered when no hour exceeds 25% of taps', () => {
    const logs = [
      makeLogAt('a', setHour(base, 8, 0)),
      makeLogAt('b', setHour(base, 12, 0)),
      makeLogAt('c', setHour(base, 16, 0)),
      makeLogAt('d', setHour(base, 20, 0)),
    ];

    expect(getDailyInsight(logs).id).toBe('scattered');
  });
});
