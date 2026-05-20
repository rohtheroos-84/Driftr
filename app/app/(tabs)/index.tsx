import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';

import { AppText } from '@/src/ui/components/AppText';
import { Screen } from '@/src/ui/components/Screen';
import { SurfaceCard } from '@/src/ui/components/SurfaceCard';
import { TapButton } from '@/src/ui/components/TapButton';
import { Toast } from '@/src/ui/components/Toast';
import {
  addLog,
  getLogsForDay,
  recomputeDayKeys,
  setLogDeletedById,
  updateLogTime,
} from '@/src/data/log-store';
import { aggregateDay, getHourlyHistogram } from '@/src/domain/daily-aggregation';
import { getDailyInsight } from '@/src/domain/insight-engine';
import { LogEntry } from '@/src/domain/log-entry';
import { copy } from '@/src/domain/copy';
import { toDayKey } from '@/src/domain/time';
import { theme } from '@/src/ui/theme';

const ESTIMATE_MINUTES_PER_TAP = 5;
const UNDO_WINDOW_MS = 3200;
const formatTime = (iso: string) => format(new Date(iso), 'h:mm a');
const MIN_BAR_HEIGHT = 6;
const MAX_BAR_HEIGHT = 28;

const mergeDateAndTime = (base: Date, time: Date) => {
  const merged = new Date(base);
  merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return merged;
};

type UndoAction = 'add' | 'delete' | null;

export default function HomeScreen() {
  const [todayLogs, setTodayLogs] = useState<LogEntry[]>([]);
  const [undoLog, setUndoLog] = useState<LogEntry | null>(null);
  const [undoAction, setUndoAction] = useState<UndoAction>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastActionLabel, setToastActionLabel] = useState<string | undefined>(undefined);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [pickerValue, setPickerValue] = useState<Date | null>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadTodayLogs = useCallback(async (dayKey: string) => {
    const logs = await getLogsForDay(dayKey);
    setTodayLogs(logs);
  }, []);

  const refreshForCurrentDay = useCallback(async () => {
    await recomputeDayKeys();
    const dayKey = toDayKey(new Date());
    await loadTodayLogs(dayKey);
  }, [loadTodayLogs]);

  useEffect(() => {
    void refreshForCurrentDay();
  }, [refreshForCurrentDay]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshForCurrentDay();
      }
    });

    return () => subscription.remove();
  }, [refreshForCurrentDay]);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  const showToast = ({
    message,
    actionLabel,
    log,
    action,
  }: {
    message: string;
    actionLabel?: string;
    log?: LogEntry;
    action?: UndoAction;
  }) => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    setToastMessage(message);
    setToastActionLabel(actionLabel);
    setUndoLog(log ?? null);
    setUndoAction(action ?? null);
    setToastVisible(true);

    undoTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
      setToastActionLabel(undefined);
      setUndoLog(null);
      setUndoAction(null);
    }, UNDO_WINDOW_MS);
  };

  const handleTap = async () => {
    const log = await addLog();
    const nextCount = todayLogs.length + 1;
    const tapWord = nextCount === 1 ? 'tap' : 'taps';

    setTodayLogs((current) => [...current, log]);
    showToast({
      message: `drift logged at ${formatTime(log.timestampIso)} - ${nextCount} ${tapWord} today`,
      actionLabel: 'undo',
      log,
      action: 'add',
    });

    if (Platform.OS === 'android') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleUndo = async () => {
    if (!undoLog || !undoAction) {
      return;
    }

    if (undoAction === 'add') {
      await setLogDeletedById(undoLog.id, true);
    }

    if (undoAction === 'delete') {
      await setLogDeletedById(undoLog.id, false);
    }

    await refreshForCurrentDay();
    setToastVisible(false);
    setToastActionLabel(undefined);
    setUndoLog(null);
    setUndoAction(null);
  };

  const handleDelete = async (log: LogEntry) => {
    const nextCount = Math.max(todayLogs.length - 1, 0);
    const tapWord = nextCount === 1 ? 'tap' : 'taps';

    await setLogDeletedById(log.id, true);
    setTodayLogs((current) => current.filter((item) => item.id !== log.id));

    showToast({
      message: `drift deleted at ${formatTime(log.timestampIso)} - ${nextCount} ${tapWord} today`,
      actionLabel: 'undo',
      log,
      action: 'delete',
    });
  };

  const applyUpdatedTime = async (log: LogEntry, time: Date) => {
    const baseDate = new Date(log.timestampIso);
    const merged = mergeDateAndTime(baseDate, time);
    const updated = await updateLogTime(log.id, merged);

    await refreshForCurrentDay();

    if (updated) {
      showToast({
        message: `${copy.microcopy.timeUpdated} to ${formatTime(updated.timestampIso)}`,
      });
    }
  };

  const handleEdit = async (log: LogEntry) => {
    if (Platform.OS === 'web') {
      const response = prompt(copy.microcopy.timePrompt);

      if (!response) {
        return;
      }

      const [hourText, minuteText] = response.split(':');
      const hours = Number(hourText);
      const minutes = Number(minuteText);

      if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
        showToast({ message: copy.microcopy.invalidTime });
        return;
      }

      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        showToast({ message: copy.microcopy.invalidRange });
        return;
      }

      const baseDate = new Date(log.timestampIso);
      const updatedTime = new Date(baseDate);
      updatedTime.setHours(hours, minutes, 0, 0);

      await applyUpdatedTime(log, updatedTime);
      return;
    }

    setEditingLog(log);
    setPickerValue(new Date(log.timestampIso));
  };

  const handleTimePickerChange = async (
    event: { type?: string },
    selectedDate?: Date,
  ) => {
    if (!editingLog) {
      return;
    }

    if (Platform.OS === 'android' && event.type === 'dismissed') {
      setEditingLog(null);
      setPickerValue(null);
      return;
    }

    if (!selectedDate) {
      return;
    }

    const log = editingLog;
    setEditingLog(null);
    setPickerValue(null);
    await applyUpdatedTime(log, selectedDate);
  };

  const aggregation = aggregateDay(todayLogs, ESTIMATE_MINUTES_PER_TAP);
  const tapCount = aggregation.tapCount;
  const tapLabel = tapCount === 1 ? 'tap' : 'taps';
  const estimatedLoss = aggregation.estimatedLossMinutes;
  const orderedLogs = [...todayLogs].sort((a, b) =>
    b.timestampIso.localeCompare(a.timestampIso),
  );
  const lastDriftLabel = aggregation.lastLogIso
    ? `last drift at ${formatTime(aggregation.lastLogIso)}`
    : 'no drifts yet';
  const insight = getDailyInsight(todayLogs);
  const histogram = useMemo(() => getHourlyHistogram(todayLogs), [todayLogs]);

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
              <AppText variant="caption" tone="faint">
                {lastDriftLabel}
              </AppText>
            </View>
            <View style={styles.spark} />
          </View>
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <AppText variant="label" tone="muted">
            insight
          </AppText>
          <AppText variant="title">{insight.title}</AppText>
          <AppText variant="body" tone="muted">
            {insight.detail}
          </AppText>
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <View style={styles.timelineHeader}>
            <AppText variant="label" tone="muted">
              timeline
            </AppText>
            <Link href="/history" asChild>
              <Pressable hitSlop={10}>
                <AppText variant="label" tone="accent">
                  {copy.labels.historyLink}
                </AppText>
              </Pressable>
            </Link>
          </View>
          <View style={styles.timeline}>
            {histogram.hours.map((count, index) => {
              const height =
                histogram.maxCount === 0
                  ? MIN_BAR_HEIGHT
                  : MIN_BAR_HEIGHT +
                    (count / histogram.maxCount) * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT);
              const opacity = count === 0 ? 0.2 : 0.75;

              return (
                <View
                  key={`bar-${index}`}
                  style={[styles.bar, { height, opacity }]}
                />
              );
            })}
          </View>
          {histogram.maxCount === 0 ? (
            <AppText variant="caption" tone="muted">
              {copy.empty.todayTimeline}
            </AppText>
          ) : null}
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <AppText variant="label" tone="muted">
            today logs
          </AppText>
          {orderedLogs.length === 0 ? (
            <AppText variant="caption" tone="muted">
              {copy.empty.todayLogs}
            </AppText>
          ) : (
            <View style={styles.logList}>
              {orderedLogs.map((log, index) => (
                <View key={log.id}>
                  <View style={styles.logRow}>
                    <View>
                      <AppText variant="body">{formatTime(log.timestampIso)}</AppText>
                      <AppText variant="caption" tone="muted">
                        drift
                      </AppText>
                    </View>
                    <View style={styles.logActions}>
                      <Pressable onPress={() => handleEdit(log)} hitSlop={10}>
                        <AppText variant="label" tone="accent">
                          edit
                        </AppText>
                      </Pressable>
                      <Pressable onPress={() => handleDelete(log)} hitSlop={10}>
                        <AppText variant="label" tone="muted">
                          delete
                        </AppText>
                      </Pressable>
                    </View>
                  </View>
                  {index < orderedLogs.length - 1 ? (
                    <View style={styles.logDivider} />
                  ) : null}
                </View>
              ))}
            </View>
          )}
          {editingLog && pickerValue ? (
            <View style={styles.pickerWrap}>
              <DateTimePicker
                value={pickerValue}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimePickerChange}
              />
            </View>
          ) : null}
        </SurfaceCard>

        <View style={styles.buttonWrap}>
          <TapButton label="log a drift" hint={copy.microcopy.tapHint} onPress={handleTap} />
        </View>

        <AppText variant="caption" tone="muted" style={styles.disclaimer}>
          time lost is an estimate based on your taps
        </AppText>
      </ScrollView>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        actionLabel={toastActionLabel}
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
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  logList: {
    gap: theme.spacing.md,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  logDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    opacity: 0.6,
    marginTop: theme.spacing.md,
  },
  pickerWrap: {
    marginTop: theme.spacing.md,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceAlt,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonWrap: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  disclaimer: {
    textAlign: 'center',
  },
});
