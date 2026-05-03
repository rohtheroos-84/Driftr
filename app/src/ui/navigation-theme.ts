import { DarkTheme, Theme } from '@react-navigation/native';

import { theme } from './theme';

export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: theme.colors.accent,
    background: theme.colors.backgroundTop,
    card: theme.colors.navBar,
    text: theme.colors.textPrimary,
    border: theme.colors.border,
    notification: theme.colors.accent,
  },
};
