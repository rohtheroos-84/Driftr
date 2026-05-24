import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import {
  flushAnalyticsEvents,
  getAnalyticsOptIn,
  setAnalyticsOptIn,
  subscribeAnalyticsOptIn,
} from '@/src/data/analytics-store';
import { copy } from '@/src/domain/copy';
import { AppText } from '@/src/ui/components/AppText';
import { Screen } from '@/src/ui/components/Screen';
import { SurfaceCard } from '@/src/ui/components/SurfaceCard';
import { theme } from '@/src/ui/theme';

export default function ModalScreen() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPreference = async () => {
      const enabled = await getAnalyticsOptIn();
      if (isMounted) {
        setAnalyticsEnabled(enabled);
      }
    };

    const unsubscribe = subscribeAnalyticsOptIn((enabled) => {
      setAnalyticsEnabled(enabled);
    });

    void loadPreference();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleToggle = async (value: boolean) => {
    setAnalyticsEnabled(value);
    await setAnalyticsOptIn(value);

    if (value) {
      void flushAnalyticsEvents();
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="display">about driftr</AppText>
          <AppText variant="caption" tone="muted">
            a tiny tool to notice where time drifts away
          </AppText>
        </View>

        <SurfaceCard style={styles.card}>
          <AppText variant="body">
            driftr turns one-tap logs into a daily summary and a single insight.
            it is built to be fast, honest, and non-judgmental.
          </AppText>
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <AppText variant="label" tone="muted">
            privacy
          </AppText>
          <AppText variant="body" tone="muted">
            {copy.privacy.statement}
          </AppText>
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
              <AppText variant="label" tone="muted">
                {copy.privacy.analyticsTitle}
              </AppText>
              <AppText variant="caption" tone="muted">
                {copy.privacy.analyticsBody}
              </AppText>
            </View>
            <Switch
              value={analyticsEnabled}
              onValueChange={handleToggle}
              trackColor={{ false: theme.colors.border, true: theme.colors.accentSoft }}
              thumbColor={analyticsEnabled ? theme.colors.accent : theme.colors.surface}
              ios_backgroundColor={theme.colors.border}
            />
          </View>
          <AppText variant="caption" tone="faint">
            {copy.privacy.analyticsEvents}
          </AppText>
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
    gap: theme.spacing.xs,
  },
  card: {
    gap: theme.spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  toggleCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
});
