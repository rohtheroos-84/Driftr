import { toDayKey } from './time';

export type LogEntry = {
  id: string;
  timestampIso: string;
  dayKey: string;
  editedAt: string | null;
  deletedAt: string | null;
};

const createId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export function createLogEntry(date: Date = new Date()): LogEntry {
  const timestampIso = date.toISOString();

  return {
    id: createId(),
    timestampIso,
    dayKey: toDayKey(date),
    editedAt: null,
    deletedAt: null,
  };
}

export function updateLogTimestamp(entry: LogEntry, date: Date): LogEntry {
  const timestampIso = date.toISOString();
  const updatedAt = new Date().toISOString();

  return {
    ...entry,
    timestampIso,
    dayKey: toDayKey(date),
    editedAt: updatedAt,
  };
}

export function setLogDeleted(entry: LogEntry, deleted: boolean): LogEntry {
  const updatedAt = new Date().toISOString();

  return {
    ...entry,
    deletedAt: deleted ? updatedAt : null,
    editedAt: updatedAt,
  };
}
