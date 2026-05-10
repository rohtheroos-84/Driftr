import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';

import { getLogsForDay, recomputeDayKeys } from '@/src/data/log-store';
import { aggregateDay, getHourlyHistogram } from '@/src/domain/daily-aggregation';
import { formatDayLabel } from '@/src/domain/day-label';
import { getDailyInsight } from '@/src/domain/insight-engine';
import { LogEntry } from '@/src/domain/log-entry';
import { AppText } from '@/src/ui/components/AppText';
import { Screen } from '@/src/ui/components/Screen';
import { SurfaceCard } from '@/src/ui/components/SurfaceCard';
import { theme } from '@/src/ui/theme';

const ESTIMATE_MINUTES_PER_TAP = 5;
const MIN_BAR_HEIGHT = 6;
const MAX_BAR_HEIGHT = 28;

export default function DayDetailScreen() {
  const params = useLocalSearchParams();
  const dayKeyValue = Array.isArray(params.dayKey) ? params.dayKey[0] : params.dayKey;
  const dayKey = typeof dayKeyValue === 'string' ? dayKeyValue : '';

  const [logs, setLogs] = useState<LogEntry[]>([]);

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

  const label = dayKey ? formatDayLabel(dayKey, 'long') : 'day detail';
  const aggregation = aggregateDay(logs, ESTIMATE_MINUTES_PER_TAP);
  const insight = getDailyInsight(logs);
  const histogram = useMemo(() => getHourlyHistogram(logs), [logs]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Link href="/history" asChild>
            <Pressable hitSlop={10}>
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
              no drifts logged for this day.
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
              no drifts logged yet for this day.
            </AppText>
          ) : null}
        </SurfaceCard>
      </ScrollView>
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
});
