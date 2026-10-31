import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TripPlanProvider } from '@/features/traveller/trip-plan/trip-plan-context';
import type { TripPlanAction } from '@/features/traveller/trip-plan/trip-plan-reducer';

const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 800 },
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
};

/** Renders a screen inside the app providers, optionally after some trip plan actions. */
export function renderWithProviders(ui: ReactElement, actions: TripPlanAction[] = []) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <TripPlanProvider initialActions={actions}>{ui}</TripPlanProvider>
    </SafeAreaProvider>,
  );
}

/** Event payload for `fireEvent(element, 'layout', …)`. */
export function layout(width: number, height: number) {
  return { nativeEvent: { layout: { x: 0, y: 0, width, height } } };
}
