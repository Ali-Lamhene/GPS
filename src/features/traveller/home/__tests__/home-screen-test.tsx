import { act, fireEvent, screen, within } from '@testing-library/react-native';
import { router } from 'expo-router';
import { BackHandler } from 'react-native';

import { layout, renderWithProviders } from '@/testing/render-with-providers';

import { playCue } from '@/services/feedback';

import { shortcutCount } from '../home-panel';
import { HomeScreen } from '../home-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/services/feedback', () => ({ playCue: jest.fn() }));

async function renderHome() {
  await renderWithProviders(<HomeScreen />);
}

async function openSheet(end: 'Départ' | 'Arrivée') {
  await fireEvent.press(screen.getByRole('button', { name: end }));
  await fireEvent(screen.getByTestId('place-grid'), 'layout', layout(320, 400));
}

async function choose(end: 'Départ' | 'Arrivée', place: string) {
  await openSheet(end);
  await fireEvent.press(
    within(screen.getByTestId('place-grid')).getByRole('button', { name: place }),
  );
}

describe('<HomeScreen />', () => {
  beforeEach(() => jest.mocked(router.push).mockClear());

  test('starts here, with only the arrival left to choose', async () => {
    await renderHome();

    expect(screen.getByRole('button', { name: 'Départ' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Arrivée' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Tous les lieux' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Continuer' })).toBeNull();
  });

  test('a shortcut chooses the arrival; cancel brings the shortcuts back', async () => {
    await renderHome();

    await fireEvent.press(screen.getByRole('button', { name: 'mon domicile' }));
    expect(playCue).toHaveBeenCalledWith('select');
    expect(screen.queryByRole('button', { name: 'mon domicile' })).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Annuler' }));
    expect(screen.queryByRole('button', { name: 'Continuer' })).toBeNull();
    expect(screen.getByRole('button', { name: 'mon domicile' })).toBeOnTheScreen();
  });

  test('« all places » opens the sheet of arrivals', async () => {
    await renderHome();

    await fireEvent.press(screen.getByRole('button', { name: 'Tous les lieux' }));

    expect(screen.getByTestId('place-grid')).toBeOnTheScreen();
  });

  test('choosing the arrival plays the select sound and offers to continue', async () => {
    await renderHome();

    await choose('Arrivée', 'la plage du Prado');
    expect(screen.queryByTestId('place-grid')).toBeNull();
    expect(playCue).toHaveBeenCalledWith('select');

    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }));
    expect(router.push).toHaveBeenCalledWith('/mode');
  });

  test('another start can be chosen from the panel', async () => {
    await renderHome();

    await choose('Départ', 'mon domicile');
    await choose('Arrivée', 'la plage du Prado');

    expect(screen.getByRole('button', { name: 'Continuer' })).toBeOnTheScreen();
  });

  test('the start cannot be picked again as the arrival', async () => {
    await renderHome();
    await choose('Départ', 'mon domicile');

    await openSheet('Arrivée');

    expect(
      within(screen.getByTestId('place-grid')).getByRole('button', { name: 'mon domicile' }),
    ).toBeDisabled();
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

describe('place sheet and Android back', () => {
  test('the back button closes the sheet', async () => {
    const listeners: (() => boolean)[] = [];
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_, listener) => {
      listeners.push(listener as () => boolean);
      return { remove: jest.fn() };
    });
    await renderWithProviders(<HomeScreen />);
    await fireEvent(screen.getByTestId('home-screen'), 'layout', layout(360, 800));
    await fireEvent.press(screen.getByRole('button', { name: 'Départ' }));

    await act(() => listeners.at(-1)?.());

    expect(screen.queryByTestId('place-grid')).toBeNull();
  });
});

describe('shortcutCount', () => {
  test('keeps « all places » on screen and room between targets', () => {
    expect(shortcutCount(360)).toBe(4);
    expect(shortcutCount(412)).toBe(4);
    expect(shortcutCount(320)).toBe(3);
  });
});
