import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

import { theme } from '../theme';

type Variant = 'display' | 'title' | 'body' | 'label' | 'caption';
type Tone = 'primary' | 'muted' | 'faint' | 'accent' | 'ink';

type AppTextProps = TextProps & {
  variant?: Variant;
  tone?: Tone;
};

export function AppText({
  variant = 'body',
  tone = 'primary',
  style,
  ...props
}: AppTextProps) {
  return <Text style={[styles.base, styles[variant], styles[tone], style]} {...props} />;
}

const styles = StyleSheet.create({
  base: {
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
  },
  display: {
    fontFamily: theme.fonts.display,
    fontSize: theme.typography.display.fontSize,
    lineHeight: theme.typography.display.lineHeight,
    letterSpacing: theme.typography.display.letterSpacing,
  },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: theme.typography.title.fontSize,
    lineHeight: theme.typography.title.lineHeight,
    letterSpacing: theme.typography.title.letterSpacing,
  },
  body: {
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  label: {
    fontFamily: theme.fonts.label,
    fontSize: theme.typography.label.fontSize,
    lineHeight: theme.typography.label.lineHeight,
    letterSpacing: theme.typography.label.letterSpacing,
    textTransform: theme.typography.label.textTransform,
  },
  caption: {
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  primary: {
    color: theme.colors.textPrimary,
  },
  muted: {
    color: theme.colors.textMuted,
  },
  faint: {
    color: theme.colors.textFaint,
  },
  accent: {
    color: theme.colors.accent,
  },
  ink: {
    color: theme.colors.ink,
  },
});
