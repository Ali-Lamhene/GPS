import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import {
  locationServicesOn,
  openLocationSettings,
  openLocationSwitch,
  requestLocationAccess,
  watchLocation,
} from '@/services/location';

import { LocationProvider, useTravellerPosition } from '../location-context';

jest.mock('@/services/location', () => ({
  requestLocationAccess: jest.fn(),
  currentLocationAccess: jest.fn(() => Promise.resolve('granted')),
  locationServicesOn: jest.fn(() => Promise.resolve(true)),
  openLocationSettings: jest.fn(),
  openLocationSwitch: jest.fn(),
  watchLocation: jest.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <LocationProvider>{children}</LocationProvider>
);

describe('the traveller position (spec 017)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('asks at start, then follows the phone once allowed', async () => {
    const stop = jest.fn();
    jest.mocked(requestLocationAccess).mockResolvedValue('granted');
    jest.mocked(watchLocation).mockImplementation((onPoint) => {
      onPoint([2.35, 48.85]);
      return stop;
    });

    const { result, unmount } = await renderHook(() => useTravellerPosition(), { wrapper });

    await waitFor(() =>
      expect(result.current.position).toEqual({ kind: 'located', point: [2.35, 48.85] }),
    );
    expect(requestLocationAccess).toHaveBeenCalledTimes(1);
    await unmount();
    expect(stop).toHaveBeenCalled();
  });

  test('refused for good: no point, and a retry opens the settings', async () => {
    jest.mocked(requestLocationAccess).mockResolvedValue('blocked');

    const { result } = await renderHook(() => useTravellerPosition(), { wrapper });

    await waitFor(() => expect(result.current.position).toEqual({ kind: 'unavailable' }));
    expect(watchLocation).not.toHaveBeenCalled();
    result.current.retry();
    expect(openLocationSettings).toHaveBeenCalled();
  });

  test('approximate only: « here » is unusable, a retry asks for the precise one', async () => {
    jest.mocked(requestLocationAccess).mockResolvedValue('coarse');

    const { result } = await renderHook(() => useTravellerPosition(), { wrapper });

    await waitFor(() => expect(result.current.position).toEqual({ kind: 'unavailable' }));
    expect(watchLocation).not.toHaveBeenCalled();
    result.current.retry();
    expect(requestLocationAccess).toHaveBeenCalledTimes(2);
  });

  test('allowed but the location switch is off: a retry opens the switch', async () => {
    jest.mocked(requestLocationAccess).mockResolvedValue('granted');
    jest.mocked(locationServicesOn).mockResolvedValue(false);
    jest.mocked(watchLocation).mockReturnValue(jest.fn());

    const { result } = await renderHook(() => useTravellerPosition(), { wrapper });

    await waitFor(() => expect(result.current.position).toEqual({ kind: 'unavailable' }));
    result.current.retry();
    expect(openLocationSwitch).toHaveBeenCalled();
  });
});
