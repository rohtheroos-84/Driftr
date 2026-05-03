import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/ui/components/AppText';
import { Screen } from '@/src/ui/components/Screen';
import { SurfaceCard } from '@/src/ui/components/SurfaceCard';
import { TapButton } from '@/src/ui/components/TapButton';
import { theme } from '@/src/ui/theme';

const barHeights = [6, 14, 10, 24, 8, 18, 12, 5, 20, 9];

export default function HomeScreen() {
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
              <AppText variant="title">0 taps</AppText>
              <AppText variant="caption" tone="muted">
                estimated loss: 0m
              </AppText>
            </View>
            <View style={styles.spark} />
          </View>
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <AppText variant="label" tone="muted">
            insight
          </AppText>
          <AppText variant="body">
            no taps yet. once you log a drift, this space will highlight your
            strongest pattern.
          </AppText>
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <AppText variant="label" tone="muted">
            timeline
          </AppText>
          <View style={styles.timeline}>
            {barHeights.map((height, index) => (
              <View
                key={`bar-${index}`}
                style={[styles.bar, { height }]}
              />
            ))}
          </View>
        </SurfaceCard>

        <View style={styles.buttonWrap}>
          <TapButton
            label="log a drift"
            hint="one tap, no guilt"
            onPress={() => {}}
          />
        </View>

        <AppText variant="caption" tone="muted" style={styles.disclaimer}>
          time lost is an estimate based on your taps
        </AppText>
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
