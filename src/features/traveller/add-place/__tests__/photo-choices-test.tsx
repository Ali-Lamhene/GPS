import { act, fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { keepPhoto, keepStreetPhoto, pickPhoto } from '@/services/photo';
import { writePlacesFile } from '@/services/place-storage';
import { findStreetPhoto } from '@/services/street-photo';
import { renderWithProviders } from '@/testing/render-with-providers';

import { useTripPlan } from '../../trip-plan/trip-plan-context';
import type { TripPlanAction } from '../../trip-plan/trip-plan-reducer';
import { PhotoScreen } from '../photo-screen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), dismissTo: jest.fn() },
  useFocusEffect: (effect: () => void) => jest.requireActual('react').useEffect(effect, [effect]),
}));
jest.mock('@/services/street-photo', () => ({ findStreetPhoto: jest.fn(async () => undefined) }));
jest.mock('@/services/address-search', () => ({ reverseAddress: jest.fn(async () => undefined) }));
jest.mock('@/services/place-storage', () => ({ writePlacesFile: jest.fn() }));
// A camera that answers the shutter, unlike the shared mock (which has no picture).
jest.mock('expo-camera', () => ({
  CameraView: jest
    .requireActual('react')
    .forwardRef(
      (_props: unknown, ref: React.Ref<{ takePictureAsync: () => Promise<{ uri: string }> }>) => {
        jest.requireActual('react').useImperativeHandle(ref, () => ({
          takePictureAsync: async () => ({ uri: 'file:///cache/Camera/shot.jpg' }),
        }));
        return null;
      },
    ),
  useCameraPermissions: () => [{ granted: true, canAskAgain: true }, jest.fn()],
}));

const STREET = { url: 'data:image/jpeg;base64,AA==', panorama: true, centre: 0.4 };
const KEPT = 'file:///files/photos/kept.jpg';

// The two journeys reach E29 with a point: « here » (E27) and an address (E30, then E28).
const JOURNEYS: { name: string; actions: TripPlanAction[] }[] = [
  {
    name: 'traveller, here (E27-E29)',
    actions: [
      { type: 'startPlace', source: 'position', point: [5.38, 43.3] },
      { type: 'setDraftIcon', icon: 'local_pharmacy' },
    ],
  },
  {
    name: 'companion, address (E30 then E29)',
    actions: [
      { type: 'startPlace', source: 'address' },
      { type: 'setDraftAddress', helpName: 'Pharmacie', point: [5.37722, 43.29655], send: false },
      { type: 'setDraftIcon', icon: 'local_pharmacy' },
    ],
  },
];

/** Reads the saved places back from the plan, so a test sees what the home will show. */
function Probe({ onPlaces }: { onPlaces: (photos: (string | undefined)[]) => void }) {
  const { customPlaces } = useTripPlan();
  onPlaces(customPlaces.map((place) => place.photo));
  return null;
}

describe.each(JOURNEYS)('photo choices, $name', ({ actions }) => {
  let photos: (string | undefined)[] = [];
  const render = () =>
    renderWithProviders(
      <>
        <PhotoScreen />
        <Probe onPlaces={(found) => (photos = found)} />
      </>,
      actions,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(writePlacesFile).mockResolvedValue({ ok: true });
    jest.mocked(findStreetPhoto).mockResolvedValue(STREET);
    photos = [];
  });

  test('the street photo offered: seen, kept, the place has it', async () => {
    jest.mocked(keepStreetPhoto).mockResolvedValue(KEPT);
    await render();

    await fireEvent.press(await screen.findByRole('button', { name: 'Photo de rue du lieu' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Garder la photo de rue' }));

    expect(keepStreetPhoto).toHaveBeenCalledWith(STREET);
    await act(async () => undefined);
    expect(photos).toContain(KEPT);
    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });

  test('its own photo from the camera: the place has it, no street photo kept', async () => {
    jest.mocked(keepPhoto).mockResolvedValue(KEPT);
    await render();
    await screen.findByRole('button', { name: 'Photo de rue du lieu' });

    await fireEvent.press(screen.getByRole('button', { name: 'Prendre la photo' }));

    expect(keepPhoto).toHaveBeenCalledWith('file:///cache/Camera/shot.jpg');
    expect(keepStreetPhoto).not.toHaveBeenCalled();
    await act(async () => undefined);
    expect(photos).toContain(KEPT);
  });

  test('its own photo from the gallery: the place has it', async () => {
    jest.mocked(pickPhoto).mockResolvedValue('file:///cache/ImagePicker/a.jpg');
    jest.mocked(keepPhoto).mockResolvedValue(KEPT);
    await render();

    await fireEvent.press(screen.getByRole('button', { name: 'Choisir une photo' }));

    expect(keepPhoto).toHaveBeenCalledWith('file:///cache/ImagePicker/a.jpg');
    expect(keepStreetPhoto).not.toHaveBeenCalled();
    await act(async () => undefined);
    expect(photos).toContain(KEPT);
  });

  test('no photo, even when a street photo is offered: the place has none', async () => {
    await render();
    await screen.findByRole('button', { name: 'Photo de rue du lieu' });

    await fireEvent.press(screen.getByRole('button', { name: 'Sans photo' }));

    expect(keepPhoto).not.toHaveBeenCalled();
    expect(keepStreetPhoto).not.toHaveBeenCalled();
    await act(async () => undefined);
    expect(photos).toEqual([undefined]);
    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });

  test('a street photo that cannot be kept: nothing saved, stay on the screen', async () => {
    jest.mocked(keepStreetPhoto).mockResolvedValue(undefined);
    await render();

    await fireEvent.press(await screen.findByRole('button', { name: 'Photo de rue du lieu' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Garder la photo de rue' }));

    expect(router.dismissTo).not.toHaveBeenCalled();
    expect(photos).toEqual([]);
    // Like a failed shot: the preview closes, the thumbnail stays, everything can be retried.
    expect(screen.queryByTestId('street-photo-preview')).toBeNull();
    expect(screen.getByRole('button', { name: 'Photo de rue du lieu' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Prendre la photo' })).toBeEnabled();
  });
});
