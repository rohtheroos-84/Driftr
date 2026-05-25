import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getAnalyticsQueue,
  setAnalyticsOptIn,
  trackAnalyticsEvent,
} from '../analytics-store';

describe('analytics-store', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('does not record events when opt-in is false', async () => {
    await setAnalyticsOptIn(false);
    await trackAnalyticsEvent('tap_logged');

    const queue = await getAnalyticsQueue();

    expect(queue.tap_logged).toBe(0);
  });

  it('records events when opt-in is true', async () => {
    await setAnalyticsOptIn(true);
    await trackAnalyticsEvent('tap_logged');

    const queue = await getAnalyticsQueue();

    expect(queue.tap_logged).toBe(1);
  });
});
