import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  createLogEntry,
  LogEntry,
  setLogDeleted,
  updateLogTimestamp,
} from '@/src/domain/log-entry';
import { toDayKeyFromIso } from '@/src/domain/time';

const LOGS_KEY = 'driftr.logs.v1';
const STORAGE_VERSION_KEY = 'driftr.storage.version';
const STORAGE_VERSION = '1';

async function ensureStorageVersion(): Promise<void> {
  const stored = await AsyncStorage.getItem(STORAGE_VERSION_KEY);

  if (stored !== STORAGE_VERSION) {
    await AsyncStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
  }
}

const normalizeLog = (value: unknown): LogEntry | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<LogEntry>;

  if (typeof candidate.id !== 'string' || typeof candidate.timestampIso !== 'string') {
    return null;
  }

  const dayKey =
    typeof candidate.dayKey === 'string' && candidate.dayKey.length > 0
      ? candidate.dayKey
      : toDayKeyFromIso(candidate.timestampIso);
  const editedAt = typeof candidate.editedAt === 'string' ? candidate.editedAt : null;
  const deletedAt = typeof candidate.deletedAt === 'string' ? candidate.deletedAt : null;

  return {
    id: candidate.id,
    timestampIso: candidate.timestampIso,
    dayKey,
    editedAt,
    deletedAt,
  };
};

const normalizeLogs = (value: unknown): LogEntry[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(normalizeLog).filter(Boolean) as LogEntry[];
};

const sortByTimestampAsc = (logs: LogEntry[]): LogEntry[] => {
  return [...logs].sort((a, b) => a.timestampIso.localeCompare(b.timestampIso));
};

const readLogs = async (): Promise<LogEntry[]> => {
  await ensureStorageVersion();
  const raw = await AsyncStorage.getItem(LOGS_KEY);

  if (!raw) {
    return [];
  }

  try {
    return sortByTimestampAsc(normalizeLogs(JSON.parse(raw)));
  } catch {
    return [];
  }
};

const writeLogs = async (logs: LogEntry[]): Promise<void> => {
  const sorted = sortByTimestampAsc(logs);
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(sorted));
};

export async function getAllLogs(): Promise<LogEntry[]> {
  return readLogs();
}

export async function getActiveLogs(): Promise<LogEntry[]> {
  const logs = await readLogs();
  return logs.filter((log) => !log.deletedAt);
}

export async function getLogsForDay(dayKey: string): Promise<LogEntry[]> {
  const logs = await getActiveLogs();
  return logs.filter((log) => log.dayKey === dayKey);
}

export async function addLog(date: Date = new Date()): Promise<LogEntry> {
  const log = createLogEntry(date);
  const logs = await readLogs();

  logs.push(log);
  await writeLogs(logs);

  return log;
}

export async function updateLogTime(
  id: string,
  date: Date,
): Promise<LogEntry | null> {
  const logs = await readLogs();
  const index = logs.findIndex((log) => log.id === id);

  if (index === -1) {
    return null;
  }

  const updated = updateLogTimestamp(logs[index], date);
  logs[index] = updated;
  await writeLogs(logs);

  return updated;
}

export async function setLogDeletedById(
  id: string,
  deleted: boolean,
): Promise<LogEntry | null> {
  const logs = await readLogs();
  const index = logs.findIndex((log) => log.id === id);

  if (index === -1) {
    return null;
  }

  const updated = setLogDeleted(logs[index], deleted);
  logs[index] = updated;
  await writeLogs(logs);

  return updated;
}
