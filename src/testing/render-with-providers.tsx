import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  LocationProvider,
  type TravellerPosition,
} from '@/features/traveller/location/location-context';
import { RoutesProvider } from '@/features/traveller/trip-plan/routes-context';
import { TripPlanProvider } from '@/features/traveller/trip-plan/trip-plan-context';
import type { TripPlanAction } from '@/features/traveller/trip-plan/trip-plan-reducer';

import { DEMO_GUIDANCE } from './fixtures/guidance';
import { DEMO_DESTINATION_IDS, DEMO_ORIGIN_IDS, DEMO_PLACES } from './fixtures/places';
import { DEMO_CURRENT_POSITION, DEMO_LEGS } from './fixtures/trips';

const PLACES = {
  places: DEMO_PLACES,
  originIds: DEMO_ORIGIN_IDS,
  destinationIds: DEMO_DESTINATION_IDS,
};
const ROUTES = { legs: DEMO_LEGS, steps: DEMO_GUIDANCE };

const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 800 },
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
};

/**
 * Renders a screen inside the app providers, with the fixture places and trips, optionally after
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
        <TripPlanProvider fixture={PLACES} initialActions={actions}>
          <RoutesProvider fixture={ROUTES}>{ui}</RoutesProvider>
        </TripPlanProvider>
      </LocationProvider>
    </SafeAreaProvider>,
  );
}

/** Event payload for `fireEvent(element, 'layout', …)`. */
export function layout(width: number, height: number) {
  return { nativeEvent: { layout: { x: 0, y: 0, width, height } } };
}
