import { act, fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { reverseAddress } from '@/services/address-search';
import { keepPhoto, keepStreetPhoto, pickPhoto } from '@/services/photo';
import { findStreetPhoto } from '@/services/street-photo';
import { layout, renderWithProviders } from '@/testing/render-with-providers';

import { PhotoScreen } from '../photo-screen';
import { cutHeight } from '../pictogram-grid';
import { PictogramScreen } from '../pictogram-screen';
import { PositionScreen } from '../position-screen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), dismissTo: jest.fn() },
  // The screen in front: its focus effect runs once mounted.
  useFocusEffect: (effect: () => void) => jest.requireActual('react').useEffect(effect, [effect]),
}));

jest.mock('@/services/street-photo', () => ({ findStreetPhoto: jest.fn(async () => undefined) }));

const STREET = { url: 'data:image/jpeg;base64,AA==', panorama: true, centre: 0.4 };

jest.mock('@/services/address-search', () => ({ reverseAddress: jest.fn(async () => undefined) }));

const drafting = [{ type: 'startPlace', source: 'position' }] as const;

describe('new place', () => {
  beforeEach(() => jest.clearAllMocks());

  test('E27: confirming the position goes on to the pictogram; closing cancels', async () => {
    await renderWithProviders(<PositionScreen />, [...drafting]);

    await fireEvent.press(screen.getByRole('button', { name: 'Enregistrer cette position' }));
    expect(router.push).toHaveBeenCalledWith('/add-place/pictogram');

    await fireEvent.press(screen.getByRole('button', { name: 'Annuler' }));
    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });

  test('E28: continuing waits for a pictogram', async () => {
    await renderWithProviders(<PictogramScreen />, [...drafting]);
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeDisabled();

    await fireEvent(screen.getByTestId('pictogram-grid'), 'layout', layout(328, 400));
    await fireEvent.press(screen.getByRole('radio', { name: 'hôpital' }));

    expect(screen.getByRole('radio', { name: 'hôpital' })).toBeChecked();
    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }));
    expect(router.push).toHaveBeenCalledWith('/add-place/photo');
  });

  test('E29: with or without a photo, the place is saved and home shows it', async () => {
    await renderWithProviders(<PhotoScreen />, [...drafting]);

    await fireEvent.press(screen.getByRole('button', { name: 'Sans photo' }));

    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });
  test('E29: a place here asks its address once, for the help card (spec 029)', async () => {
    await renderWithProviders(<PhotoScreen />, [
      { type: 'startPlace', source: 'position', point: [5.38, 43.3] },
      { type: 'setDraftIcon', icon: 'local_pharmacy' },
    ]);

    await fireEvent.press(screen.getByRole('button', { name: 'Sans photo' }));

    expect(reverseAddress).toHaveBeenCalledWith([5.38, 43.3]);
  });

  test('E29: a home asks its address too, for the way back (spec 029)', async () => {
    await renderWithProviders(<PhotoScreen />, [
      { type: 'startPlace', source: 'position', point: [5.38, 43.3] },
      { type: 'setDraftIcon', icon: 'home' },
    ]);

    await fireEvent.press(screen.getByRole('button', { name: 'Sans photo' }));

    expect(reverseAddress).toHaveBeenCalledWith([5.38, 43.3]);
  });

  test('E29: a photo chosen in the picker is re-encoded, then the place saved (spec 020)', async () => {
    jest.mocked(pickPhoto).mockResolvedValue('file:///cache/ImagePicker/a.jpg');
    jest.mocked(keepPhoto).mockResolvedValue('file:///files/photos/abc.jpg');
    await renderWithProviders(<PhotoScreen />, [...drafting]);

    await fireEvent.press(screen.getByRole('button', { name: 'Choisir une photo' }));

    expect(keepPhoto).toHaveBeenCalledWith('file:///cache/ImagePicker/a.jpg');
    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });

  test('E29: no point, no street photo looked for (spec 033)', async () => {
    await renderWithProviders(<PhotoScreen />, [...drafting]);

    expect(findStreetPhoto).not.toHaveBeenCalled();
    expect(screen.queryByTestId('street-photo-searching')).toBeNull();
  });

  test('E29: a wheel turns while the street photo is looked for, then nothing if none (spec 033)', async () => {
    let answer: (found: undefined) => void = () => undefined;
    jest.mocked(findStreetPhoto).mockReturnValue(new Promise((resolve) => (answer = resolve)));
    await renderWithProviders(<PhotoScreen />, [
      { type: 'startPlace', source: 'position', point: [5.38, 43.3] },
      { type: 'setDraftIcon', icon: 'home' },
    ]);

    // Hidden places too: the user's choice (spec 033).
    expect(findStreetPhoto).toHaveBeenCalledWith([5.38, 43.3], expect.anything());
    expect(screen.getByTestId('street-photo-searching')).toBeOnTheScreen();

    await act(async () => answer(undefined));

    expect(screen.queryByTestId('street-photo-searching')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Photo de rue du lieu' })).toBeNull();
  });

  test('E29: the street photo shown, then closed by a second touch (spec 033)', async () => {
    jest.mocked(findStreetPhoto).mockResolvedValue(STREET);
    await renderWithProviders(<PhotoScreen />, [
      { type: 'startPlace', source: 'position', point: [5.38, 43.3] },
      { type: 'setDraftIcon', icon: 'home' },
    ]);
    const thumbnail = await screen.findByRole('button', { name: 'Photo de rue du lieu' });

    await fireEvent.press(thumbnail);
    await fireEvent.press(thumbnail);

    expect(screen.queryByTestId('street-photo-preview')).toBeNull();
    expect(screen.getByRole('button', { name: 'Prendre la photo' })).toBeOnTheScreen();
  });

  test('E29: touching the street photo keeps it, then saves the place (spec 033)', async () => {
    jest.mocked(findStreetPhoto).mockResolvedValue(STREET);
    jest.mocked(keepStreetPhoto).mockResolvedValue('file:///files/photos/abc.jpg');
    await renderWithProviders(<PhotoScreen />, [
      { type: 'startPlace', source: 'address' },
      { type: 'setDraftAddress', helpName: 'Pharmacie', point: [5.37722, 43.29655], send: false },
      { type: 'setDraftIcon', icon: 'local_pharmacy' },
    ]);

    // A first touch shows it in the frame; the shutter becomes « keep ».
    await fireEvent.press(await screen.findByRole('button', { name: 'Photo de rue du lieu' }));
    expect(screen.getByTestId('street-photo-preview')).toBeOnTheScreen();
    expect(keepStreetPhoto).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Garder la photo de rue' }));

    expect(keepStreetPhoto).toHaveBeenCalledWith(STREET);
    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });

  test('E29: picker closed without a photo: stay on the screen', async () => {
    jest.mocked(pickPhoto).mockResolvedValue(undefined);
    await renderWithProviders(<PhotoScreen />, [...drafting]);

    await fireEvent.press(screen.getByRole('button', { name: 'Choisir une photo' }));

    expect(router.dismissTo).not.toHaveBeenCalled();
  });
});

describe('cutHeight', () => {
  test('ends half-way through a row, so a cut row shows there is more', () => {
    // Rows of 80 + 10: two whole rows, then half of the third.
    expect(cutHeight(260, 80)).toBe(220);
    expect(cutHeight(300, 0)).toBe(300);
  });
});

describe('a place sent by the companion (spec 019)', () => {
  test('E28 ✓ opens the share sheet with the link and keeps nothing', async () => {
    const share = jest
      .spyOn(jest.requireActual<typeof import('react-native')>('react-native').Share, 'share')
      .mockResolvedValue({ action: 'sharedAction', activityType: undefined });
    await renderWithProviders(<PictogramScreen />, [
      { type: 'startPlace', source: 'address' },
      { type: 'setDraftAddress', helpName: 'Pharmacie', point: [5.37722, 43.29655], send: true },
      { type: 'setDraftIcon', icon: 'local_pharmacy' },
    ]);

    await fireEvent.press(screen.getByRole('button', { name: 'Envoyer' }));

    expect(share).toHaveBeenCalledWith({
      message: 'https://ali-lamhene.github.io/l/#1/43.29655/5.37722/local_pharmacy',
    });
    expect(router.dismissTo).toHaveBeenCalledWith('/');
    expect(router.push).not.toHaveBeenCalledWith('/add-place/photo');
  });
});
