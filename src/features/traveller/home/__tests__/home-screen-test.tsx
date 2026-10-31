import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { layout, renderWithProviders } from '@/testing/render-with-providers';

import { HomeScreen } from '../home-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

async function renderHome() {
  await renderWithProviders(<HomeScreen />);
  await fireEvent(screen.getByTestId('home-screen'), 'layout', layout(360, 800));
}

async function openSheet(end: 'Départ' | 'Arrivée') {
  await fireEvent.press(screen.getByRole('button', { name: end }));
  await fireEvent(screen.getByTestId('place-grid'), 'layout', layout(320, 400));
}

async function choose(end: 'Départ' | 'Arrivée', place: string) {
  await openSheet(end);
  await fireEvent.press(screen.getByRole('button', { name: place }));
}

describe('<HomeScreen />', () => {
  beforeEach(() => jest.mocked(router.push).mockClear());

  test('starts with only the start tile available', async () => {
    await renderHome();

    expect(screen.getByRole('button', { name: 'Départ' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Arrivée' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Continuer' })).toBeNull();
  });

  test('choosing the start, then the arrival, offers to continue', async () => {
    await renderHome();

    await choose('Départ', 'mon domicile');
    expect(screen.queryByTestId('place-grid')).toBeNull();
    expect(screen.getByRole('button', { name: 'Arrivée' })).toBeEnabled();

    await choose('Arrivée', 'la plage du Prado');
    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }));

    expect(router.push).toHaveBeenCalledWith('/mode');
  });

  test('the start cannot be picked again as the arrival', async () => {
    await renderHome();
    await choose('Départ', 'mon domicile');

    await openSheet('Arrivée');

    expect(screen.getByRole('button', { name: 'mon domicile' })).toBeDisabled();
  });

  test('saving the position opens the new place flow', async () => {
    await renderHome();
    await openSheet('Départ');

    await fireEvent.press(screen.getByRole('button', { name: 'Enregistrer ma position' }));

    expect(router.push).toHaveBeenCalledWith('/add-place/position');
  });

  test('help is one touch away', async () => {
    await renderHome();

    await fireEvent.press(screen.getByRole('button', { name: 'Aide' }));

    expect(router.push).toHaveBeenCalledWith('/help');
  });
});
