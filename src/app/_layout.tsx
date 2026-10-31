import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { TripPlanProvider } from '@/features/traveller/trip-plan/trip-plan-context';
import { colors, useAppFonts } from '@/ui/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fontsReady = useAppFonts();

  useEffect(() => {
    if (fontsReady) SplashScreen.hide();
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <TripPlanProvider>
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }}
      >
        {/* The help card opens over the current screen, as a full-screen dialog (E24). */}
        <Stack.Screen name="help" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
    </TripPlanProvider>
  );
}
