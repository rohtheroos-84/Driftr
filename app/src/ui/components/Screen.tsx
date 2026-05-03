import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme';

type ScreenProps = {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
};

export function Screen({ children, contentStyle }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[theme.colors.backgroundTop, theme.colors.backgroundBottom]}
        style={styles.background}
      >
        <View pointerEvents="none" style={styles.glowTop} />
        <View pointerEvents="none" style={styles.glowBottom} />
        <View style={[styles.content, contentStyle]}>{children}</View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.backgroundTop,
  },
  background: {
    flex: 1,
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: theme.colors.glowSoft,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -160,
    right: -100,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: theme.colors.glowSoft,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
});
