import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';

import { TripPlanProvider } from '@/features/traveller/trip-plan/trip-plan-context';
import { SystemBarsFrame } from '@/ui/system-bars/system-bars-frame';
import { colors, useAppFonts } from '@/ui/theme';

SplashScreen.preventAutoHideAsync();
// The window behind the screens: warm white, never the black of a phone in dark mode, seen
// while a screen slides in or the keyboard opens.
SystemUI.setBackgroundColorAsync(colors.warmWhite).catch(() => undefined);

export default function RootLayout() {
  const fontsReady = useAppFonts();

  useEffect(() => {
    if (fontsReady) SplashScreen.hide();
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <TripPlanProvider>
      <SystemBarsFrame>
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }}
        >
          {/* The help card opens over the current screen, as a full-screen dialog (E24). */}
          <Stack.Screen name="help" options={{ presentation: 'fullScreenModal' }} />
        </Stack>
      </SystemBarsFrame>
    </TripPlanProvider>
  );
}
