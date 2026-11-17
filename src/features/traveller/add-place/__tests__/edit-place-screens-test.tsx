import { act, fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { ScrollView } from 'react-native';

import { PICTOGRAM_CATALOGUE } from '@/domain/pictograms';
import type { Place } from '@/domain/place';
import { deletePhoto, keepPhoto, keepStreetPhoto, pickPhoto } from '@/services/photo';
import { playCue } from '@/services/feedback';
import { writePlacesFile } from '@/services/place-storage';
import { findStreetPhoto } from '@/services/street-photo';
import { layout, renderWithProviders } from '@/testing/render-with-providers';

import { useTripPlan } from '../../trip-plan/trip-plan-context';
import type { TripPlanAction } from '../../trip-plan/trip-plan-reducer';
import { PhotoScreen } from '../photo-screen';
import { PictogramScreen } from '../pictogram-screen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), dismissTo: jest.fn() },
  useFocusEffect: (effect: () => void) => jest.requireActual('react').useEffect(effect, [effect]),
}));
jest.mock('@/services/feedback', () => ({ playCue: jest.fn() }));
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
const OLD = 'file:///files/photos/old.jpg';
const KEPT = 'file:///files/photos/kept.jpg';

const school: Place = {
  id: 'p-school',
  icon: 'school',
  photo: OLD,
  helpName: 'le lycée',
  address: '1 rue du Lycée, Marseille',
  point: [5.38, 43.3],
  createdAt: 5,
};

/** A saved place, then a long press on it (spec 037). */
const editing = (place: Place): TripPlanAction[] => [
  { type: 'addPlace', place },
  { type: 'startEdit', place },
];

/** Reads the saved place back from the plan, as the home will show it. */
let seen: Place | undefined;
const see = (place: Place | undefined) => {
  seen = place;
};
function Probe({ id, onPlace = see }: { id: string; onPlace?: (place?: Place) => void }) {
  const { customPlaces } = useTripPlan();
  onPlace(customPlaces.find((place) => place.id === id));
  return null;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(writePlacesFile).mockResolvedValue({ ok: true });
  seen = undefined;
});

/** The grid lays its pictograms out once it knows its width. */
const showGrid = () => fireEvent(screen.getByTestId('pictogram-grid'), 'layout', layout(328, 400));

describe('E28 when changing a place (spec 037)', () => {
  test('opens on its pictogram, with its photo on the preview pin', async () => {
    await renderWithProviders(<PictogramScreen />, editing(school));
    await showGrid();

    expect(screen.getByRole('radio', { name: 'école' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeEnabled();
    expect(screen.getByTestId('place-pin-photo').props.source.uri).toBe(OLD);
  });

  test('the pictogram chosen shows large over the photo of the preview pin', async () => {
    await renderWithProviders(<PictogramScreen />, editing(school));

    expect(screen.getByTestId('place-pin-badge')).toHaveStyle({ width: 36, height: 36 });
  });

  test('the grid scrolls once to the place pictogram, without animation', async () => {
    const scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo');
    await renderWithProviders(<PictogramScreen />, editing(school));
    await showGrid();
    const family = PICTOGRAM_CATALOGUE.find(({ pictograms }) =>
      pictograms.some(({ icon }) => icon === 'school'),
    )?.family;

    await fireEvent(screen.getByTestId(`family-${family}`), 'layout', layout(328, 600, 500));
    await fireEvent(screen.getByTestId('initial-family-grid'), 'layout', layout(328, 200, 11));
    await fireEvent(screen.getByRole('radio', { name: 'école' }), 'layout', layout(76, 76, 86));

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ y: 597, animated: false });
    scrollTo.mockRestore();
  });

  test('another pictogram, then on to the photo', async () => {
    await renderWithProviders(<PictogramScreen />, editing(school));
    await showGrid();

    await fireEvent.press(screen.getByRole('radio', { name: 'parc' }));
    expect(screen.getByRole('radio', { name: 'parc' })).toBeChecked();
    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }));

    expect(router.push).toHaveBeenCalledWith('/add-place/photo');
  });

  test('back goes home and changes nothing', async () => {
    await renderWithProviders(
      <>
        <PictogramScreen />
        <Probe id={school.id} />
      </>,
      editing(school),
    );
    await showGrid();

    await fireEvent.press(screen.getByRole('radio', { name: 'parc' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Retour' }));

    expect(router.dismissTo).toHaveBeenCalledWith('/');
    expect(router.back).not.toHaveBeenCalled();
    expect(writePlacesFile).not.toHaveBeenCalled();
    expect(seen).toEqual(school);
  });
});

describe('E29 when changing a place (spec 037)', () => {
  const render = (actions: TripPlanAction[], id = school.id) =>
    renderWithProviders(
      <>
        <PhotoScreen />
        <Probe id={id} />
      </>,
      actions,
    );

  test('opens on its own photo; ✓ keeps it and saves the new pictogram', async () => {
    await render([...editing(school), { type: 'setDraftIcon', icon: 'park' }]);

    expect(screen.getByTestId('current-photo-preview').props.source.uri).toBe(OLD);
    expect(screen.queryByRole('button', { name: 'Prendre la photo' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Garder la photo actuelle' }));
    await act(async () => undefined);

    expect(seen).toEqual({ ...school, icon: 'park' });
    expect(deletePhoto).not.toHaveBeenCalled();
    expect(keepPhoto).not.toHaveBeenCalled();
    expect(playCue).toHaveBeenCalledWith('saved');
    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });

  test('its thumbnail closes the photo: the shutter comes back, and opens it again', async () => {
    await render(editing(school));

    const thumbnail = screen.getByRole('button', { name: 'Photo actuelle du lieu' });
    expect(thumbnail).toBeSelected();
    await fireEvent.press(thumbnail);
    expect(screen.queryByTestId('current-photo-preview')).toBeNull();
    expect(screen.getByRole('button', { name: 'Prendre la photo' })).toBeEnabled();

    await fireEvent.press(thumbnail);
    expect(screen.getByTestId('current-photo-preview')).toBeOnTheScreen();
  });

  test('back goes to the pictogram, even with its own photo open', async () => {
    await render(editing(school));

    await fireEvent.press(screen.getByRole('button', { name: 'Retour' }));

    expect(router.back).toHaveBeenCalled();
  });

  test('the street photo offered replaces the old one', async () => {
    jest.mocked(findStreetPhoto).mockResolvedValue(STREET);
    jest.mocked(keepStreetPhoto).mockResolvedValue(KEPT);
    await render(editing(school));

    await fireEvent.press(await screen.findByRole('button', { name: 'Photo de rue du lieu' }));
    // The street photo takes the frame from the place's own photo.
    expect(screen.queryByTestId('current-photo-preview')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Garder la photo de rue' }));
    await act(async () => undefined);

    expect(keepStreetPhoto).toHaveBeenCalledWith(STREET);
    expect(seen).toEqual({ ...school, photo: KEPT });
    expect(deletePhoto).toHaveBeenCalledWith(OLD);
  });

  test('its own photo from the camera replaces the old one', async () => {
    jest.mocked(keepPhoto).mockResolvedValue(KEPT);
    await render(editing(school));

    await fireEvent.press(screen.getByRole('button', { name: 'Photo actuelle du lieu' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Prendre la photo' }));
    await act(async () => undefined);

    expect(keepPhoto).toHaveBeenCalledWith('file:///cache/Camera/shot.jpg');
    expect(seen).toEqual({ ...school, photo: KEPT });
    expect(deletePhoto).toHaveBeenCalledWith(OLD);
  });

  test('its own photo from the gallery replaces the old one', async () => {
    jest.mocked(pickPhoto).mockResolvedValue('file:///cache/ImagePicker/a.jpg');
    jest.mocked(keepPhoto).mockResolvedValue(KEPT);
    await render(editing(school));

    await fireEvent.press(screen.getByRole('button', { name: 'Choisir une photo' }));
    await act(async () => undefined);

    expect(keepPhoto).toHaveBeenCalledWith('file:///cache/ImagePicker/a.jpg');
    expect(seen).toEqual({ ...school, photo: KEPT });
    expect(deletePhoto).toHaveBeenCalledWith(OLD);
  });

  test('no photo is first shown, the photo removed only by ✓', async () => {
    await render([...editing(school), { type: 'setDraftIcon', icon: 'park' }]);

    await fireEvent.press(screen.getByRole('button', { name: 'Sans photo' }));
    // Nothing removed yet: the place without photo is shown, ✓ in place of the shutter.
    expect(writePlacesFile).not.toHaveBeenCalled();
    expect(screen.getByTestId('no-photo-preview')).toBeOnTheScreen();
    expect(screen.queryByTestId('current-photo-preview')).toBeNull();
    expect(screen.getByRole('button', { name: 'Sans photo' })).toBeSelected();

    await fireEvent.press(screen.getByRole('button', { name: 'Garder sans photo' }));
    await act(async () => undefined);

    expect(seen).toBeDefined();
    expect(seen).not.toHaveProperty('photo');
    expect(seen?.icon).toBe('park');
    expect(deletePhoto).toHaveBeenCalledWith(OLD);
  });

  test('no photo, then back or a second touch: nothing removed', async () => {
    await render(editing(school));

    await fireEvent.press(screen.getByRole('button', { name: 'Sans photo' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Retour' }));
    expect(router.back).not.toHaveBeenCalled();
    expect(screen.queryByTestId('no-photo-preview')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Sans photo' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Sans photo' }));
    expect(screen.queryByTestId('no-photo-preview')).toBeNull();
    expect(writePlacesFile).not.toHaveBeenCalled();
  });

  test('a place without photo: « no photo » finishes at once, as at creation', async () => {
    const bare: Place = { id: 'p-bare', icon: 'park', point: [5.4, 43.3], createdAt: 2 };
    await render(editing(bare), bare.id);

    await fireEvent.press(screen.getByRole('button', { name: 'Sans photo' }));
    await act(async () => undefined);

    expect(writePlacesFile).toHaveBeenCalledTimes(1);
    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });

  test('its own photo open: no camera, and the street photo comes without a sound', async () => {
    jest.mocked(findStreetPhoto).mockResolvedValue(STREET);
    await render(editing(school));
    await screen.findByRole('button', { name: 'Photo de rue du lieu' });

    expect(playCue).not.toHaveBeenCalledWith('select');
    expect(screen.queryByRole('button', { name: 'Prendre la photo' })).toBeNull();
  });

  test('a place without photo opens on the camera, with no thumbnail of its own', async () => {
    const bare: Place = { id: 'p-bare', icon: 'park', point: [5.4, 43.3], createdAt: 2 };
    jest.mocked(keepPhoto).mockResolvedValue(KEPT);
    await render(editing(bare), bare.id);

    expect(screen.queryByRole('button', { name: 'Photo actuelle du lieu' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Prendre la photo' }));
    await act(async () => undefined);

    expect(seen).toEqual({ ...bare, photo: KEPT });
  });

  test('a new photo that cannot be saved is deleted; the old one stays', async () => {
    jest.mocked(writePlacesFile).mockResolvedValue({ ok: false });
    jest.mocked(pickPhoto).mockResolvedValue('file:///cache/ImagePicker/a.jpg');
    jest.mocked(keepPhoto).mockResolvedValue(KEPT);
    await render(editing(school));

    await fireEvent.press(screen.getByRole('button', { name: 'Choisir une photo' }));
    await act(async () => undefined);

    expect(deletePhoto).toHaveBeenCalledWith(KEPT);
    expect(deletePhoto).not.toHaveBeenCalledWith(OLD);
  });
});
