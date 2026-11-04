import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  LocationProvider,
  type TravellerPosition,
} from '@/features/traveller/location/location-context';
import { DEMO_CURRENT_POSITION } from '@/features/traveller/demo/trips';
import { RoutesProvider } from '@/features/traveller/trip-plan/routes-context';
import { TripPlanProvider } from '@/features/traveller/trip-plan/trip-plan-context';
import type { TripPlanAction } from '@/features/traveller/trip-plan/trip-plan-reducer';

const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 800 },
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
};

/**
 * Renders a screen inside the app providers, with the demonstration places, optionally after
 * some trip plan actions.
 */
export function renderWithProviders(
  ui: ReactElement,
  actions: TripPlanAction[] = [],
  position: TravellerPosition = { kind: 'located', point: DEMO_CURRENT_POSITION },
) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <LocationProvider fixed={position}>
        <TripPlanProvider demo initialActions={actions}>
          <RoutesProvider demo>{ui}</RoutesProvider>
        </TripPlanProvider>
      </LocationProvider>
    </SafeAreaProvider>,
  );
}

/** Event payload for `fireEvent(element, 'layout', …)`. */
export function layout(width: number, height: number) {
  return { nativeEvent: { layout: { x: 0, y: 0, width, height } } };
}
