import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';

import { LocationProvider } from '@/features/traveller/location/location-context';
import { RoutesProvider } from '@/features/traveller/trip-plan/routes-context';
import { TripPlanProvider } from '@/features/traveller/trip-plan/trip-plan-context';
import { useStoredPlaces } from '@/features/traveller/trip-plan/use-stored-places';
import { SystemBarsFrame } from '@/ui/system-bars/system-bars-frame';
import { colors, useAppFonts } from '@/ui/theme';

SplashScreen.preventAutoHideAsync();
// Demonstration places, for development only (spec 015): never in a published build.
const DEMO_PLACES = __DEV__ && process.env.EXPO_PUBLIC_DEMO_PLACES === '1';
// The window behind the screens: warm white, never the black of a phone in dark mode, seen
// while a screen slides in or the keyboard opens.
SystemUI.setBackgroundColorAsync(colors.warmWhite).catch(() => undefined);

export default function RootLayout() {
  const fontsReady = useAppFonts();
  // Spec 015: the home only shows once the places are read, never empty then filled.
  const stored = useStoredPlaces();
  const ready = fontsReady && stored.kind === 'ready';

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  if (!ready) return null;

  return (
    <LocationProvider>
      <TripPlanProvider places={stored.places} demo={DEMO_PLACES}>
        <RoutesProvider demo={DEMO_PLACES}>
          <SystemBarsFrame>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.surface },
              }}
            >
              {/* The help card opens over the current screen, as a full-screen dialog (E24). */}
              <Stack.Screen name="help" options={{ presentation: 'fullScreenModal' }} />
            </Stack>
          </SystemBarsFrame>
        </RoutesProvider>
      </TripPlanProvider>
    </LocationProvider>
  );
}
