import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { keepPhoto, pickPhoto } from '@/services/photo';
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
  test('E29: a photo chosen in the picker is re-encoded, then the place saved (spec 020)', async () => {
    jest.mocked(pickPhoto).mockResolvedValue('file:///cache/ImagePicker/a.jpg');
    jest.mocked(keepPhoto).mockResolvedValue('file:///files/photos/abc.jpg');
    await renderWithProviders(<PhotoScreen />, [...drafting]);

    await fireEvent.press(screen.getByRole('button', { name: 'Choisir une photo' }));

    expect(keepPhoto).toHaveBeenCalledWith('file:///cache/ImagePicker/a.jpg');
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
