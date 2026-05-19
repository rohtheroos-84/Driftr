import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'driftr.onboarding.complete';

let listeners: Array<(complete: boolean) => void> = [];

export async function getOnboardingComplete(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
  return stored === 'true';
}

export async function setOnboardingComplete(value: boolean): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, value ? 'true' : 'false');
  listeners.forEach((listener) => listener(value));
}

export function subscribeOnboardingStatus(
  listener: (complete: boolean) => void,
): () => void {
  listeners = [...listeners, listener];

  return () => {
    listeners = listeners.filter((entry) => entry !== listener);
  };
}
