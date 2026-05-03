import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/ui/components/AppText';
import { Screen } from '@/src/ui/components/Screen';
import { SurfaceCard } from '@/src/ui/components/SurfaceCard';
import { theme } from '@/src/ui/theme';

export default function ModalScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <AppText variant="display">about driftr</AppText>
        <AppText variant="caption" tone="muted">
          a tiny tool to notice where time drifts away
        </AppText>
        <SurfaceCard style={styles.card}>
          <AppText variant="body">
            driftr turns one-tap logs into a daily summary and a single insight.
            it is built to be fast, honest, and non-judgmental.
          </AppText>
        </SurfaceCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.lg,
  },
  card: {
    gap: theme.spacing.sm,
  },
});
