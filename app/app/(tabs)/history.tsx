import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/ui/components/AppText';
import { Screen } from '@/src/ui/components/Screen';
import { SurfaceCard } from '@/src/ui/components/SurfaceCard';
import { theme } from '@/src/ui/theme';

type DaySummary = {
  label: string;
  taps: number;
  loss: string;
  insight: string;
};

const samples: DaySummary[] = [
  {
    label: 'today',
    taps: 0,
    loss: '0m',
    insight: 'no data yet. log a drift to unlock a pattern.',
  },
  {
    label: 'yesterday',
    taps: 6,
    loss: '30m',
    insight: 'most drifts clustered after lunch.',
  },
  {
    label: '2 days ago',
    taps: 3,
    loss: '15m',
    insight: 'evening drift was the strongest window.',
  },
];

export default function HistoryScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="display">history</AppText>
          <AppText variant="caption" tone="muted">
            your last 14 days, at a glance
          </AppText>
        </View>

        {samples.map((item) => (
          <SurfaceCard key={item.label} style={styles.card}>
            <View style={styles.row}>
              <AppText variant="label" tone="muted">
                {item.label}
              </AppText>
              <AppText variant="caption" tone="muted">
                {item.taps} taps
              </AppText>
            </View>
            <AppText variant="title">{item.loss} estimated</AppText>
            <AppText variant="body" tone="muted">
              {item.insight}
            </AppText>
          </SurfaceCard>
        ))}
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
});
