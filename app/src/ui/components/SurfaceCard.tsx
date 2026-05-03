import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../theme';

type SurfaceCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function SurfaceCard({ children, style }: SurfaceCardProps) {
  return (
    <LinearGradient
      colors={[theme.colors.surface, theme.colors.surfaceAlt]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.card,
  },
});
