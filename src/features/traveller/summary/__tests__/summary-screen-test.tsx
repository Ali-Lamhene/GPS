import { fireEvent, screen } from '@testing-library/react-native';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';

import { renderWithProviders } from '@/testing/render-with-providers';

import { SummaryScreen } from '../summary-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), dismissTo: jest.fn() } }));

const ready = [
  { type: 'chooseOrigin', placeId: 'home' },
  { type: 'chooseDestination', placeId: 'beach' },
] as const;

describe('<SummaryScreen />', () => {
  beforeEach(() => jest.clearAllMocks());

  test('opening a transit leg shows its stops, which can be read aloud', async () => {
    jest
      .mocked(Speech.getAvailableVoicesAsync)
      .mockResolvedValue([
        { identifier: 'fr-local', name: 'fr', language: 'fr-FR', quality: 'Default' },
      ] as Speech.Voice[]);
    await renderWithProviders(<SummaryScreen />, [...ready]);
    expect(screen.queryByText('Jardin des Plantes')).toBeNull();

    await fireEvent.press(screen.getByText('C3'));

    expect(screen.getByText('Jardin des Plantes')).toBeOnTheScreen();
    expect(screen.getByText('Saint-Charles')).toBeOnTheScreen();

    const [listenFrom] = screen.getAllByRole('button', { name: 'Écouter le nom' });
    expect(listenFrom).toBeDefined();
    if (listenFrom) await fireEvent.press(listenFrom);
    await new Promise(process.nextTick);
    await new Promise(process.nextTick);
    expect(Speech.speak).toHaveBeenCalledWith('Jardin des Plantes', expect.anything());
  });

  test('touching an open leg closes it', async () => {
    await renderWithProviders(<SummaryScreen />, [...ready]);

    await fireEvent.press(screen.getByText('C3'));
    await fireEvent.press(screen.getByText('C3'));

    expect(screen.queryByText('Jardin des Plantes')).toBeNull();
  });

  test('the disc starts the guidance, home ends the trip', async () => {
    await renderWithProviders(<SummaryScreen />, [...ready]);

    await fireEvent.press(screen.getByRole('button', { name: 'Démarrer le trajet' }));
    expect(router.push).toHaveBeenCalledWith('/guidance');

    await fireEvent.press(screen.getByRole('button', { name: 'Accueil' }));
    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });
});
