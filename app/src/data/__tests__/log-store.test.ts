import AsyncStorage from '@react-native-async-storage/async-storage';

import { addLog, getAllLogs } from '../log-store';

describe('log-store', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('reads back logs after they are written', async () => {
    const date = new Date('2026-05-10T08:30:00.000Z');
    const created = await addLog(date);

    const logs = await getAllLogs();

    expect(logs).toHaveLength(1);
    expect(logs[0].timestampIso).toBe(created.timestampIso);
    expect(logs[0].dayKey).toBe(created.dayKey);
  });
});
