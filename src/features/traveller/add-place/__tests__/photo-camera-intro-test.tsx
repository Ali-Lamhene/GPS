import { act, fireEvent, screen } from '@testing-library/react-native';

import { openLocationSettings } from '@/services/location';
import { renderWithProviders } from '@/testing/render-with-providers';

import { PhotoScreen } from '../photo-screen';

const mockRequestPermission = jest.fn();
let mockPermission = { granted: false, canAskAgain: true };

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), dismissTo: jest.fn() },
  useFocusEffect: (effect: () => void) => jest.requireActual('react').useEffect(effect, [effect]),
}));
jest.mock('@/services/street-photo', () => ({ findStreetPhoto: jest.fn(async () => undefined) }));
jest.mock('@/services/address-search', () => ({ reverseAddress: jest.fn(async () => undefined) }));
jest.mock('@/services/place-storage', () => ({ writePlacesFile: jest.fn() }));
jest.mock('@/services/location', () => ({ openLocationSettings: jest.fn() }));
jest.mock('expo-camera', () => ({
  CameraView: () => null,
  useCameraPermissions: () => [mockPermission, mockRequestPermission],
}));

const ACTIONS = [
  { type: 'startPlace', source: 'position', point: [5.38, 43.3] },
  { type: 'setDraftIcon', icon: 'local_pharmacy' },
] as const;

describe('the camera permission, explained first (spec 038)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPermission = { granted: false, canAskAgain: true };
  });

  test('not given, Android can ask: the screen shows, the window only opens after ✓', async () => {
    await renderWithProviders(<PhotoScreen />, [...ACTIONS]);

    expect(screen.getByTestId('permission-intro-camera-ask')).toBeTruthy();
    expect(mockRequestPermission).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }));
    expect(mockRequestPermission).toHaveBeenCalledTimes(1);
    await act(async () => undefined);
    expect(screen.queryByTestId('permission-intro-camera-ask')).toBeNull();
  });

  test('✗: no window, the screen closes and the photo choices stay', async () => {
    await renderWithProviders(<PhotoScreen />, [...ACTIONS]);

    await fireEvent.press(screen.getByRole('button', { name: 'Pas maintenant' }));

    expect(mockRequestPermission).not.toHaveBeenCalled();
    expect(screen.queryByTestId('permission-intro-camera-ask')).toBeNull();
  });

  test('already given: no explanation, no window', async () => {
    mockPermission = { granted: true, canAskAgain: true };
    await renderWithProviders(<PhotoScreen />, [...ACTIONS]);

    expect(screen.queryByTestId('permission-intro-camera-ask')).toBeNull();
    expect(mockRequestPermission).not.toHaveBeenCalled();
  });

  test('refused for good: the settings drawing, ✓ opens the settings', async () => {
    mockPermission = { granted: false, canAskAgain: false };
    await renderWithProviders(<PhotoScreen />, [...ACTIONS]);

    expect(screen.getByTestId('permission-intro-camera-settings')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }));
    expect(openLocationSettings).toHaveBeenCalledTimes(1);
    expect(mockRequestPermission).not.toHaveBeenCalled();
  });

  test('after ✗ the greyed shutter brings the explanation back: there is a way back', async () => {
    await renderWithProviders(<PhotoScreen />, [...ACTIONS]);
    await fireEvent.press(screen.getByRole('button', { name: 'Pas maintenant' }));
    expect(screen.queryByTestId('permission-intro-camera-ask')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Prendre la photo' }));

    expect(screen.getByTestId('permission-intro-camera-ask')).toBeTruthy();
    expect(mockRequestPermission).not.toHaveBeenCalled();
  });
});
