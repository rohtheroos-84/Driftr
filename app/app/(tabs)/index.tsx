import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { AppText } from '@/src/ui/components/AppText';
import { Screen } from '@/src/ui/components/Screen';
import { SurfaceCard } from '@/src/ui/components/SurfaceCard';
import { TapButton } from '@/src/ui/components/TapButton';
import { Toast } from '@/src/ui/components/Toast';
import { addLog, getLogsForDay, setLogDeletedById } from '@/src/data/log-store';
import { LogEntry } from '@/src/domain/log-entry';
import { toDayKey } from '@/src/domain/time';
import { theme } from '@/src/ui/theme';

const barHeights = [6, 14, 10, 24, 8, 18, 12, 5, 20, 9];
const ESTIMATE_MINUTES_PER_TAP = 5;
const UNDO_WINDOW_MS = 3200;

export default function HomeScreen() {
  const [todayLogs, setTodayLogs] = useState<LogEntry[]>([]);
  const [undoLog, setUndoLog] = useState<LogEntry | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadTodayLogs = useCallback(async () => {
    const dayKey = toDayKey(new Date());
    const logs = await getLogsForDay(dayKey);
    setTodayLogs(logs);
  }, []);

  useEffect(() => {
    void loadTodayLogs();
  }, [loadTodayLogs]);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  const showUndoToast = (log: LogEntry) => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    setUndoLog(log);
    setToastVisible(true);

    undoTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
      setUndoLog(null);
    }, UNDO_WINDOW_MS);
  };

  const handleTap = async () => {
    const log = await addLog();
    setTodayLogs((current) => [...current, log]);
    showUndoToast(log);

    if (Platform.OS === 'android') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleUndo = async () => {
    if (!undoLog) {
      return;
    }

    await setLogDeletedById(undoLog.id, true);
    setTodayLogs((current) => current.filter((log) => log.id !== undoLog.id));
    setToastVisible(false);
    setUndoLog(null);
  };

  const tapCount = todayLogs.length;
  const tapLabel = tapCount === 1 ? 'tap' : 'taps';
  const estimatedLoss = tapCount * ESTIMATE_MINUTES_PER_TAP;
  const insightCopy =
    tapCount === 0
      ? 'no taps yet. once you log a drift, this space will highlight your strongest pattern.'
      : 'insight generation lands in phase 3. for now, keep logging your drifts.';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="display">driftr</AppText>
          <AppText variant="caption" tone="muted">
            one tap to mark a drift
          </AppText>
        </View>

        <SurfaceCard style={styles.card}>
          <AppText variant="label" tone="muted">
            today
          </AppText>
          <View style={styles.summaryRow}>
            <View>
              <AppText variant="title">
                {tapCount} {tapLabel}
              </AppText>
              <AppText variant="caption" tone="muted">
                estimated loss: {estimatedLoss}m
              </AppText>
            </View>
            <View style={styles.spark} />
          </View>
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <AppText variant="label" tone="muted">
            insight
          </AppText>
          <AppText variant="body">{insightCopy}</AppText>
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <AppText variant="label" tone="muted">
            timeline
          </AppText>
          <View style={styles.timeline}>
            {barHeights.map((height, index) => (
              <View key={`bar-${index}`} style={[styles.bar, { height }]} />
            ))}
          </View>
        </SurfaceCard>

        <View style={styles.buttonWrap}>
          <TapButton label="log a drift" hint="one tap, no guilt" onPress={handleTap} />
        </View>

        <AppText variant="caption" tone="muted" style={styles.disclaimer}>
          time lost is an estimate based on your taps
        </AppText>
      </ScrollView>

      <Toast
        visible={toastVisible}
        message="drift logged"
        actionLabel="undo"
        onAction={handleUndo}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  card: {
    gap: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spark: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.glowSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  bar: {
    width: 10,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.accentSoft,
    opacity: 0.7,
  },
  buttonWrap: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  disclaimer: {
    textAlign: 'center',
  },
});
