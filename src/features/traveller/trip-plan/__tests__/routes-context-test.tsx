import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { findRoute } from '@/services/routing';

import { LocationProvider } from '../../location/location-context';
import { RoutesProvider, useRoutes } from '../routes-context';
import { TripPlanProvider, useTripPlan } from '../trip-plan-context';

jest.mock('@/services/routing', () => ({ findRoute: jest.fn() }));

const WALK = {
  kind: 'walk',
  minutes: 12,
  path: [
    [5.37, 43.29],
    [5.38, 43.3],
  ],
} as const;
const places = [
  { id: 'a', icon: 'school', point: [5.37, 43.29], createdAt: 1 },
  { id: 'b', icon: 'local_hospital', point: [5.38, 43.3], createdAt: 2 },
] as const;

function wrapper({ children }: { children: ReactNode }) {
  return (
    <LocationProvider fixed={{ kind: 'located', point: [5.36, 43.28] }}>
      <TripPlanProvider
        places={places}
        initialActions={[
          { type: 'chooseOrigin', placeId: 'a' },
          { type: 'chooseDestination', placeId: 'b' },
        ]}
      >
        <RoutesProvider>{children}</RoutesProvider>
      </TripPlanProvider>
    </LocationProvider>
  );
}

describe('RoutesProvider (spec 021)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('computes the trip by each mode from the two places, then builds its guidance', async () => {
    jest.mocked(findRoute).mockResolvedValue({ ok: true, legs: [WALK] });

    const { result } = await renderHook(() => ({ routes: useRoutes(), plan: useTripPlan() }), {
      wrapper,
    });
    // Nothing is asked before the traveller goes on from the home.
    expect(findRoute).not.toHaveBeenCalled();
    await act(() => result.current.routes.request());

    await waitFor(() => expect(result.current.routes.routes.walk.kind).toBe('ready'));
    expect(findRoute).toHaveBeenCalledWith(
      [5.37, 43.29],
      [5.38, 43.3],
      'transit',
      expect.anything(),
    );
    // No car (spec 026): only on foot and public transport are asked.
    expect(findRoute).toHaveBeenCalledTimes(2);
    expect(result.current.routes.legs).toEqual([WALK]);
    expect(result.current.routes.steps.at(-1)?.instruction.kind).toBe('walkToDestination');
  });

  test('no network: every mode says so', async () => {
    jest.mocked(findRoute).mockResolvedValue({ ok: false, reason: 'offline' });

    const { result } = await renderHook(() => useRoutes(), { wrapper });
    await act(() => result.current.request());

    await waitFor(() => expect(result.current.routes.transit.kind).toBe('offline'));
    expect(result.current.legs).toEqual([]);
  });

  test('a service error offers no trip, never « no network »', async () => {
    jest.mocked(findRoute).mockResolvedValue({ ok: false, reason: 'service' });

    const { result } = await renderHook(() => useRoutes(), { wrapper });
    await act(() => result.current.request());

    await waitFor(() => expect(result.current.routes.walk).toEqual({ kind: 'none' }));
  });
});
