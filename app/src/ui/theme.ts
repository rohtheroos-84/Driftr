export const theme = {
  colors: {
    backgroundTop: '#0b0c0e',
    backgroundBottom: '#0f1511',
    surface: '#151b21',
    surfaceAlt: '#10151b',
    accent: '#b7ff3c',
    accentSoft: '#79e62f',
    textPrimary: '#f1f5f0',
    textMuted: '#9aa3a8',
    textFaint: '#6d767d',
    border: '#1f2832',
    navBar: '#0d1116',
    ink: '#0b0c0e',
    glow: 'rgba(183, 255, 60, 0.24)',
    glowSoft: 'rgba(183, 255, 60, 0.12)',
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  radii: {
    sm: 10,
    md: 16,
    lg: 22,
    pill: 999,
  },
  fonts: {
    display: 'SpaceGrotesk_700Bold',
    title: 'SpaceGrotesk_500Medium',
    body: 'SpaceGrotesk_400Regular',
    label: 'SpaceGrotesk_500Medium',
  },
  typography: {
    display: {
      fontSize: 30,
      lineHeight: 36,
      letterSpacing: -0.2,
    },
    title: {
      fontSize: 20,
      lineHeight: 26,
      letterSpacing: -0.1,
    },
    body: {
      fontSize: 16,
      lineHeight: 22,
    },
    label: {
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.6,
      textTransform: 'uppercase' as const,
    },
    caption: {
      fontSize: 13,
      lineHeight: 18,
    },
  },
  shadows: {
    card: {
      shadowColor: 'rgba(0, 0, 0, 0.45)',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 18,
      elevation: 8,
    },
    glow: {
      shadowColor: 'rgba(183, 255, 60, 0.55)',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 10,
    },
  },
} as const;

export type Theme = typeof theme;
