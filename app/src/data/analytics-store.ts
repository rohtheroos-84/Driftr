import AsyncStorage from '@react-native-async-storage/async-storage';

export type AnalyticsEventName =
  | 'tap_logged'
  | 'insight_opened'
  | 'history_opened'
  | 'onboarding_complete';

type AnalyticsQueue = Record<AnalyticsEventName, number>;

const ANALYTICS_OPT_IN_KEY = 'driftr.analytics.optin';
const ANALYTICS_QUEUE_KEY = 'driftr.analytics.queue.v1';

const emptyQueue: AnalyticsQueue = {
  tap_logged: 0,
  insight_opened: 0,
  history_opened: 0,
  onboarding_complete: 0,
};

let listeners: Array<(enabled: boolean) => void> = [];

const normalizeQueue = (value: unknown): AnalyticsQueue => {
  if (!value || typeof value !== 'object') {
    return { ...emptyQueue };
  }

  const candidate = value as Partial<AnalyticsQueue>;

  return {
    tap_logged: Number.isFinite(candidate.tap_logged) ? Number(candidate.tap_logged) : 0,
    insight_opened: Number.isFinite(candidate.insight_opened)
      ? Number(candidate.insight_opened)
      : 0,
    history_opened: Number.isFinite(candidate.history_opened)
      ? Number(candidate.history_opened)
      : 0,
    onboarding_complete: Number.isFinite(candidate.onboarding_complete)
      ? Number(candidate.onboarding_complete)
      : 0,
  };
};

const readQueue = async (): Promise<AnalyticsQueue> => {
  const raw = await AsyncStorage.getItem(ANALYTICS_QUEUE_KEY);

  if (!raw) {
    return { ...emptyQueue };
  }

  try {
    return normalizeQueue(JSON.parse(raw));
  } catch {
    return { ...emptyQueue };
  }
};

const writeQueue = async (queue: AnalyticsQueue): Promise<void> => {
  await AsyncStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify(queue));
};

export async function getAnalyticsOptIn(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(ANALYTICS_OPT_IN_KEY);
  return stored === 'true';
}

export async function setAnalyticsOptIn(value: boolean): Promise<void> {
  await AsyncStorage.setItem(ANALYTICS_OPT_IN_KEY, value ? 'true' : 'false');
  listeners.forEach((listener) => listener(value));
}

export function subscribeAnalyticsOptIn(
  listener: (enabled: boolean) => void,
): () => void {
  listeners = [...listeners, listener];

  return () => {
    listeners = listeners.filter((entry) => entry !== listener);
  };
}

export async function trackAnalyticsEvent(name: AnalyticsEventName): Promise<void> {
  const enabled = await getAnalyticsOptIn();

  if (!enabled) {
    return;
  }

  const queue = await readQueue();
  queue[name] = (queue[name] ?? 0) + 1;
  await writeQueue(queue);
}

export async function flushAnalyticsEvents(): Promise<void> {
  const enabled = await getAnalyticsOptIn();

  if (!enabled) {
    return;
  }

  const queue = await readQueue();
  const hasEvents = Object.values(queue).some((count) => count > 0);

  if (!hasEvents) {
    return;
  }

  console.info('[driftr] analytics', queue);
  await writeQueue({ ...emptyQueue });
}

export async function getAnalyticsQueue(): Promise<AnalyticsQueue> {
  return readQueue();
}
