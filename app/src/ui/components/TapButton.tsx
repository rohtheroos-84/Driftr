import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppText } from './AppText';
import { theme } from '../theme';

type TapButtonProps = {
  label: string;
  onPress: () => void;
  hint?: string;
  pulse?: boolean;
};

export function TapButton({ label, onPress, hint, pulse: pulseEnabled = true }: TapButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!pulseEnabled) {
      pulseAnim.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [pulseEnabled, pulseAnim]);

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.22, 0],
  });

  return (
    <View style={styles.wrap}>
      {pulseEnabled ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pulse,
            {
              opacity: pulseOpacity,
              transform: [{ scale: pulseScale }],
            },
          ]}
        />
      ) : null}
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        accessibilityRole="button"
      >
        <Animated.View style={[styles.animated, { transform: [{ scale }] }]}>
          <LinearGradient
            colors={[theme.colors.accent, '#e4ff8a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <AppText variant="title" tone="ink" style={styles.label}>
              {label}
            </AppText>
            {hint ? (
              <AppText variant="caption" tone="ink" style={styles.hint}>
                {hint}
              </AppText>
            ) : null}
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.glow,
  },
  animated: {
    borderRadius: theme.radii.pill,
    ...theme.shadows.glow,
  },
  button: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  hint: {
    marginTop: theme.spacing.xs,
    opacity: 0.7,
  },
});
