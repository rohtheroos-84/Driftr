import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Link, useLocalSearchParams } from 'expo-router';

import { trackAnalyticsEvent } from '@/src/data/analytics-store';
import {
  getLogsForDay,
  recomputeDayKeys,
  setLogDeletedById,
  updateLogTime,
} from '@/src/data/log-store';
import { aggregateDay, getHourlyHistogram } from '@/src/domain/daily-aggregation';
import { formatDayLabel } from '@/src/domain/day-label';
import { getDailyInsight } from '@/src/domain/insight-engine';
import { LogEntry } from '@/src/domain/log-entry';
import { copy } from '@/src/domain/copy';
import { AppText } from '@/src/ui/components/AppText';
import { Screen } from '@/src/ui/components/Screen';
import { SurfaceCard } from '@/src/ui/components/SurfaceCard';
import { Toast } from '@/src/ui/components/Toast';
import { theme } from '@/src/ui/theme';

const ESTIMATE_MINUTES_PER_TAP = 5;
const MIN_BAR_HEIGHT = 6;
const MAX_BAR_HEIGHT = 28;
const UNDO_WINDOW_MS = 3200;
const formatTime = (iso: string) => format(new Date(iso), 'h:mm a');
const HIT_SLOP = 14;

const mergeDateAndTime = (base: Date, time: Date) => {
  const merged = new Date(base);
  merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return merged;
};

type UndoAction = 'delete' | null;

export default function DayDetailScreen() {
  const params = useLocalSearchParams();
  const dayKeyValue = Array.isArray(params.dayKey) ? params.dayKey[0] : params.dayKey;
  const dayKey = typeof dayKeyValue === 'string' ? dayKeyValue : '';

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [pickerValue, setPickerValue] = useState<Date | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastActionLabel, setToastActionLabel] = useState<string | undefined>(undefined);
  const [undoLog, setUndoLog] = useState<LogEntry | null>(null);
  const [undoAction, setUndoAction] = useState<UndoAction>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadDay = useCallback(async () => {
    if (!dayKey) {
      setLogs([]);
      return;
    }

    await recomputeDayKeys();
    const entries = await getLogsForDay(dayKey);
    setLogs(entries);
  }, [dayKey]);

  useEffect(() => {
    void loadDay();
  }, [loadDay]);

  useEffect(() => {
    if (dayKey) {
      void trackAnalyticsEvent('insight_opened');
    }
  }, [dayKey]);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  const label = dayKey ? formatDayLabel(dayKey, 'long') : 'day detail';
  const aggregation = aggregateDay(logs, ESTIMATE_MINUTES_PER_TAP);
  const insight = getDailyInsight(logs);
  const histogram = useMemo(() => getHourlyHistogram(logs), [logs]);

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

  const applyUpdatedTime = async (log: LogEntry, time: Date) => {
    const baseDate = new Date(log.timestampIso);
    const merged = mergeDateAndTime(baseDate, time);
    const updated = await updateLogTime(log.id, merged);

    await loadDay();

    if (updated) {
      showToast({ message: copy.microcopy.timeUpdated });
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

  const handleDelete = async (log: LogEntry) => {
    await setLogDeletedById(log.id, true);
    await loadDay();
    showToast({
      message: copy.microcopy.driftDeleted,
      actionLabel: 'undo',
      log,
      action: 'delete',
    });
  };

  const handleUndo = async () => {
    if (!undoLog || !undoAction) {
      return;
    }

    if (undoAction === 'delete') {
      await setLogDeletedById(undoLog.id, false);
    }

    await loadDay();
    setToastVisible(false);
    setToastActionLabel(undefined);
    setUndoLog(null);
    setUndoAction(null);
  };

  const orderedLogs = [...logs].sort((a, b) => b.timestampIso.localeCompare(a.timestampIso));

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Link href="/history" asChild>
            <Pressable hitSlop={HIT_SLOP}>
              <AppText variant="label" tone="accent">
                back to history
              </AppText>
            </Pressable>
          </Link>
          <AppText variant="display">{label}</AppText>
          <AppText variant="caption" tone="muted">
            daily summary
          </AppText>
        </View>

        {logs.length === 0 ? (
          <SurfaceCard style={styles.card}>
            <AppText variant="body" tone="muted">
              {copy.empty.dayDetail}
            </AppText>
          </SurfaceCard>
        ) : (
          <SurfaceCard style={styles.card}>
            <AppText variant="label" tone="muted">
              summary
            </AppText>
            <View style={styles.summaryRow}>
              <View>
                <AppText variant="title">
                  {aggregation.tapCount} {aggregation.tapCount === 1 ? 'tap' : 'taps'}
                </AppText>
                <AppText variant="caption" tone="muted">
                  estimated loss: {aggregation.estimatedLossMinutes}m
                </AppText>
                <AppText variant="caption" tone="faint">
                  {aggregation.lastLogIso
                    ? `last drift at ${new Date(aggregation.lastLogIso).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}`
                    : 'no drifts logged for this day'}
                </AppText>
              </View>
              <View style={styles.spark} />
            </View>
          </SurfaceCard>
        )}

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
          <AppText variant="label" tone="muted">
            timeline
          </AppText>
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
              {copy.empty.dayDetail}
            </AppText>
          ) : null}
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <AppText variant="label" tone="muted">
            logs
          </AppText>
          {orderedLogs.length === 0 ? (
            <AppText variant="caption" tone="muted">
              {copy.empty.dayDetail}
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
                      <Pressable onPress={() => handleEdit(log)} hitSlop={HIT_SLOP}>
                        <AppText variant="label" tone="accent">
                          edit
                        </AppText>
                      </Pressable>
                      <Pressable onPress={() => handleDelete(log)} hitSlop={HIT_SLOP}>
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
});
