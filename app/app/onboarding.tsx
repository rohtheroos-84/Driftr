import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { setOnboardingComplete } from '@/src/data/onboarding-store';
import { AppText } from '@/src/ui/components/AppText';
import { Screen } from '@/src/ui/components/Screen';
import { SurfaceCard } from '@/src/ui/components/SurfaceCard';
import { theme } from '@/src/ui/theme';

type Step = {
  title: string;
  body: string;
  note?: string;
};

const steps: Step[] = [
  {
    title: 'notice the drift',
    body: 'tap once when attention slips. no notes, no friction.',
    note: 'your focus is yours. driftr stays out of the way.',
  },
  {
    title: 'see the day',
    body: 'driftr turns taps into a daily count and a simple estimate.',
    note: 'time lost is an estimate based on your taps.',
  },
  {
    title: 'one clear insight',
    body: 'each day gets a single calm pattern, not a wall of stats.',
    note: 'you decide what to do with it next.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const animated = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(10)).current;

  const step = steps[index];
  const isLast = index === steps.length - 1;

  useEffect(() => {
    animated.setValue(0);
    translate.setValue(10);

    Animated.parallel([
      Animated.timing(animated, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, translate, index]);

  const dots = useMemo(() => steps.map((_, stepIndex) => stepIndex === index), [index]);

  const handleNext = async () => {
    if (!isLast) {
      setIndex((current) => current + 1);
      return;
    }

    await setOnboardingComplete(true);
    router.replace('/(tabs)');
  };

  const handleBack = () => {
    if (index === 0) {
      return;
    }

    setIndex((current) => current - 1);
  };

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.header}>
          <AppText variant="label" tone="accent">
            step {index + 1} of {steps.length}
          </AppText>
          <AppText variant="display">welcome to driftr</AppText>
          <AppText variant="caption" tone="muted">
            a light way to notice where time drifts
          </AppText>
        </View>

        <Animated.View style={[styles.cardWrap, { opacity: animated, transform: [{ translateY: translate }] }]}>
          <SurfaceCard style={styles.card}>
            <View style={styles.badge}>
              <AppText variant="label" tone="accent">
                {index + 1}
              </AppText>
            </View>
            <AppText variant="title">{step.title}</AppText>
            <AppText variant="body" tone="muted">
              {step.body}
            </AppText>
            {step.note ? (
              <AppText variant="caption" tone="faint">
                {step.note}
              </AppText>
            ) : null}
          </SurfaceCard>
        </Animated.View>

        <View style={styles.dots}>
          {dots.map((active, stepIndex) => (
            <View
              key={`dot-${stepIndex}`}
              style={[styles.dot, active ? styles.dotActive : null]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable onPress={handleBack} disabled={index === 0} hitSlop={10}>
            <View style={[styles.secondaryButton, index === 0 ? styles.disabled : null]}>
              <AppText variant="label" tone="muted">
                back
              </AppText>
            </View>
          </Pressable>
          <Pressable onPress={handleNext} hitSlop={10}>
            <LinearGradient
              colors={[theme.colors.accent, '#e4ff8a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <AppText variant="title" tone="ink">
                {isLast ? 'start' : 'next'}
              </AppText>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xl,
  },
  header: {
    gap: theme.spacing.xs,
  },
  cardWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    gap: theme.spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: theme.colors.accent,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  secondaryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  primaryButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
