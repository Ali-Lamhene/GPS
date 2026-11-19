import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { AppState } from 'react-native';

import {
  currentLocationAccess,
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

describe('the traveller position (specs 017 and 038)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('already allowed: nothing is explained or asked, the phone is followed', async () => {
    const stop = jest.fn();
    jest.mocked(currentLocationAccess).mockResolvedValue('granted');
    jest.mocked(watchLocation).mockImplementation((onPoint) => {
      onPoint([2.35, 48.85]);
      return stop;
    });

    const { result, unmount } = await renderHook(() => useTravellerPosition(), { wrapper });

    await waitFor(() =>
      expect(result.current.position).toEqual({ kind: 'located', point: [2.35, 48.85] }),
    );
    expect(result.current.intro).toBeUndefined();
    expect(requestLocationAccess).not.toHaveBeenCalled();
    await unmount();
    expect(stop).toHaveBeenCalled();
  });

  test('not given yet: the explanation first, the system window only after ✓', async () => {
    jest.mocked(currentLocationAccess).mockResolvedValue('denied');
    jest.mocked(requestLocationAccess).mockResolvedValue('granted');
    jest.mocked(watchLocation).mockImplementation((onPoint) => {
      onPoint([2.35, 48.85]);
      return jest.fn();
    });

    const { result } = await renderHook(() => useTravellerPosition(), { wrapper });

    await waitFor(() => expect(result.current.intro).toBe('ask'));
    expect(requestLocationAccess).not.toHaveBeenCalled();

    await act(async () => result.current.answerIntro(true));

    expect(requestLocationAccess).toHaveBeenCalledTimes(1);
    expect(result.current.intro).toBeUndefined();
    await waitFor(() =>
      expect(result.current.position).toEqual({ kind: 'located', point: [2.35, 48.85] }),
    );
  });

  test('✗ at the start: no window, « here » stays crossed out, no point', async () => {
    jest.mocked(currentLocationAccess).mockResolvedValue('denied');

    const { result } = await renderHook(() => useTravellerPosition(), { wrapper });

    await waitFor(() => expect(result.current.intro).toBe('ask'));
    await act(async () => result.current.answerIntro(false));

    expect(result.current.intro).toBeUndefined();
    expect(result.current.position).toEqual({ kind: 'unavailable' });
    expect(requestLocationAccess).not.toHaveBeenCalled();
    expect(watchLocation).not.toHaveBeenCalled();
  });

  test('refused for good: no explanation at start; a retry shows it for the settings', async () => {
    jest.mocked(currentLocationAccess).mockResolvedValue('blocked');

    const { result } = await renderHook(() => useTravellerPosition(), { wrapper });

    await waitFor(() => expect(result.current.position).toEqual({ kind: 'unavailable' }));
    expect(result.current.intro).toBeUndefined();
    expect(watchLocation).not.toHaveBeenCalled();

    await act(async () => result.current.retry());
    expect(result.current.intro).toBe('settings');
    expect(openLocationSettings).not.toHaveBeenCalled();

    await act(async () => result.current.answerIntro(true));
    expect(openLocationSettings).toHaveBeenCalledTimes(1);
    expect(requestLocationAccess).not.toHaveBeenCalled();
  });

  test('approximate only: « here » is unusable, a retry explains, ✓ asks for the precise one', async () => {
    jest.mocked(currentLocationAccess).mockResolvedValue('coarse');
    jest.mocked(requestLocationAccess).mockResolvedValue('coarse');

    const { result } = await renderHook(() => useTravellerPosition(), { wrapper });

    await waitFor(() => expect(result.current.position).toEqual({ kind: 'unavailable' }));
    expect(result.current.intro).toBeUndefined();
    expect(watchLocation).not.toHaveBeenCalled();

    await act(async () => result.current.retry());
    expect(result.current.intro).toBe('ask');

    await act(async () => result.current.answerIntro(true));
    expect(requestLocationAccess).toHaveBeenCalledTimes(1);
  });

  test('allowed but the location switch is off: a retry opens the switch, no explanation', async () => {
    jest.mocked(currentLocationAccess).mockResolvedValue('granted');
    jest.mocked(locationServicesOn).mockResolvedValue(false);
    jest.mocked(watchLocation).mockReturnValue(jest.fn());

    const { result } = await renderHook(() => useTravellerPosition(), { wrapper });

    await waitFor(() => expect(result.current.position).toEqual({ kind: 'unavailable' }));
    await act(async () => result.current.retry());
    expect(openLocationSwitch).toHaveBeenCalled();
    expect(result.current.intro).toBeUndefined();
  });

  test('back from the background with the explanation up: it follows what the phone now says', async () => {
    const listeners: ((state: string) => void)[] = [];
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
      listeners.push(listener as (state: string) => void);
      return { remove: jest.fn() };
    });
    jest.mocked(currentLocationAccess).mockResolvedValue('denied');

    const { result } = await renderHook(() => useTravellerPosition(), { wrapper });
    await waitFor(() => expect(result.current.intro).toBe('ask'));

    // Refused for good meanwhile, in the settings: the way out is the settings.
    jest.mocked(currentLocationAccess).mockResolvedValue('blocked');
    await act(async () => listeners.forEach((notify) => notify('active')));
    expect(result.current.intro).toBe('settings');

    // Allowed meanwhile: nothing left to explain.
    jest.mocked(currentLocationAccess).mockResolvedValue('granted');
    await act(async () => listeners.forEach((notify) => notify('active')));
    expect(result.current.intro).toBeUndefined();
  });
});
