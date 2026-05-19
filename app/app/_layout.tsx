import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider } from '@react-navigation/native';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  getOnboardingComplete,
  subscribeOnboardingStatus,
} from '@/src/data/onboarding-store';
import { navigationTheme } from '@/src/ui/navigation-theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    ...FontAwesome.font,
  });
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    let isMounted = true;

    const loadOnboarding = async () => {
      const complete = await getOnboardingComplete();
      if (isMounted) {
        setOnboardingComplete(complete);
      }
    };

    const unsubscribe = subscribeOnboardingStatus((complete) => {
      setOnboardingComplete(complete);
    });

    void loadOnboarding();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loaded && onboardingComplete !== null) {
      SplashScreen.hideAsync();
    }
  }, [loaded, onboardingComplete]);

  if (!loaded || onboardingComplete === null) {
    return null;
  }

  return <RootLayoutNav onboardingComplete={onboardingComplete} />;
}

function RootLayoutNav({ onboardingComplete }: { onboardingComplete: boolean }) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inOnboarding = segments[0] === 'onboarding';

    if (!onboardingComplete && !inOnboarding) {
      router.replace('/onboarding');
      return;
    }

    if (onboardingComplete && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [onboardingComplete, router, segments]);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        <Stack>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
