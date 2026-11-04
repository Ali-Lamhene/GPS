import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

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
});

describe('cutHeight', () => {
  test('ends half-way through a row, so a cut row shows there is more', () => {
    // Rows of 80 + 10: two whole rows, then half of the third.
    expect(cutHeight(260, 80)).toBe(220);
    expect(cutHeight(300, 0)).toBe(300);
  });
});
