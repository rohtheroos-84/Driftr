import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AppState,
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Link } from 'expo-router';

import { trackAnalyticsEvent } from '@/src/data/analytics-store';
import { getActiveLogs, recomputeDayKeys } from '@/src/data/log-store';
import { aggregateDay } from '@/src/domain/daily-aggregation';
import { formatDayLabel } from '@/src/domain/day-label';
import { getDailyInsight } from '@/src/domain/insight-engine';
import { LogEntry } from '@/src/domain/log-entry';
import { buildPatternComparison } from '@/src/domain/pattern-comparison';
import { copy } from '@/src/domain/copy';
import { AppText } from '@/src/ui/components/AppText';
import { Screen } from '@/src/ui/components/Screen';
import { SurfaceCard } from '@/src/ui/components/SurfaceCard';
import { theme } from '@/src/ui/theme';

type DaySummary = {
  dayKey: string;
  label: string;
  tapCount: number;
  estimatedLoss: number;
  insightTitle: string;
};

const ESTIMATE_MINUTES_PER_TAP = 5;
const MAX_DAYS = 14;

const groupByDayKey = (logs: LogEntry[]) => {
  const map = new Map<string, LogEntry[]>();

  logs.forEach((log) => {
    const entries = map.get(log.dayKey) ?? [];
    entries.push(log);
    map.set(log.dayKey, entries);
  });

  return map;
};

export default function HistoryScreen() {
  const [summaries, setSummaries] = useState<DaySummary[]>([]);
  const [comparison, setComparison] = useState<ReturnType<
    typeof buildPatternComparison
  > | null>(null);

  const loadHistory = useCallback(async () => {
    await recomputeDayKeys();
    const logs = await getActiveLogs();
    const grouped = groupByDayKey(logs);
    const dayKeys = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a));

    const nextSummaries = dayKeys.slice(0, MAX_DAYS).map((dayKey) => {
      const dayLogs = grouped.get(dayKey) ?? [];
      const aggregation = aggregateDay(dayLogs, ESTIMATE_MINUTES_PER_TAP);
      const insight = getDailyInsight(dayLogs);

      return {
        dayKey,
        label: formatDayLabel(dayKey),
        tapCount: aggregation.tapCount,
        estimatedLoss: aggregation.estimatedLossMinutes,
        insightTitle: insight.title,
      };
    });

    setSummaries(nextSummaries);
    setComparison(buildPatternComparison(logs, ESTIMATE_MINUTES_PER_TAP));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void trackAnalyticsEvent('history_opened');
      const task = InteractionManager.runAfterInteractions(() => {
        void loadHistory();
      });

      return () => task.cancel();
    }, [loadHistory]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void loadHistory();
      }
    });

    return () => subscription.remove();
  }, [loadHistory]);

  const comparisonCopy = useMemo(() => {
    if (!comparison) {
      return null;
    }

    const deltaCountLabel =
      comparison.deltaCount === 0
        ? 'even with yesterday'
        : `${comparison.deltaCount > 0 ? '+' : ''}${comparison.deltaCount} taps`;
    const deltaLossLabel =
      comparison.deltaLossMinutes === 0
        ? 'same estimated loss'
        : `${comparison.deltaLossMinutes > 0 ? '+' : ''}${comparison.deltaLossMinutes}m`;

    const topHourLabel = comparison.topHour
      ? `${comparison.topHour.label} (${comparison.topHour.count} taps, ${Math.round(
          comparison.topHour.share * 100,
        )}%)`
      : copy.empty.topHour;

    return {
      todayLine: `today: ${comparison.todayCount} taps (${comparison.todayLossMinutes}m)`,
      yesterdayLine: `yesterday: ${comparison.yesterdayCount} taps (${comparison.yesterdayLossMinutes}m)`,
      deltaLine: `change: ${deltaCountLabel}, ${deltaLossLabel}`,
      topHourLine: `top hour (last 7 days): ${topHourLabel}`,
    };
  }, [comparison]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="display">history</AppText>
          <AppText variant="caption" tone="muted">
            your last 14 days, at a glance
          </AppText>
        </View>

        {comparisonCopy ? (
          <SurfaceCard style={styles.card}>
            <AppText variant="label" tone="muted">
              comparisons
            </AppText>
            <View style={styles.comparisonBlock}>
              <AppText variant="body">{comparisonCopy.todayLine}</AppText>
              <AppText variant="caption" tone="muted">
                {comparisonCopy.yesterdayLine}
              </AppText>
              <AppText variant="caption" tone="accent">
                {comparisonCopy.deltaLine}
              </AppText>
            </View>
            <View style={styles.comparisonBlock}>
              <AppText variant="body">{comparisonCopy.topHourLine}</AppText>
            </View>
          </SurfaceCard>
        ) : null}

        {summaries.length === 0 ? (
          <SurfaceCard style={styles.card}>
            <AppText variant="body" tone="muted">
              {copy.empty.history}
            </AppText>
          </SurfaceCard>
        ) : (
          summaries.map((item) => (
            <Link key={item.dayKey} href={`/history/${item.dayKey}`} asChild>
              <Pressable accessibilityRole="button">
                <SurfaceCard style={styles.card}>
                  <View style={styles.row}>
                    <AppText variant="label" tone="muted">
                      {item.label}
                    </AppText>
                    <AppText variant="caption" tone="muted">
                      {item.tapCount} taps
                    </AppText>
                  </View>
                  <AppText variant="title">{item.estimatedLoss}m estimated</AppText>
                  <AppText variant="body" tone="muted">
                    insight: {item.insightTitle}
                  </AppText>
                  <AppText variant="label" tone="accent">
                    {copy.labels.viewDetails}
                  </AppText>
                </SurfaceCard>
              </Pressable>
            </Link>
          ))
        )}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comparisonBlock: {
    gap: theme.spacing.xs,
  },
});
