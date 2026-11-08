import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { renderWithProviders } from '@/testing/render-with-providers';

import { ModeScreen } from '../mode-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

const ready = [
  { type: 'chooseOrigin', placeId: 'home' },
  { type: 'chooseDestination', placeId: 'beach' },
] as const;

describe('<ModeScreen />', () => {
  test('public transport is chosen first and shows its legs with line ids', async () => {
    await renderWithProviders(<ModeScreen />, [...ready]);

    expect(screen.getByRole('radio', { name: 'Transports en commun' })).toBeChecked();
    expect(screen.getByText('41')).toBeOnTheScreen();
    expect(screen.getByText('M1')).toBeOnTheScreen();
  });

  test('offers on foot and public transport only, no car (spec 026)', async () => {
    await renderWithProviders(<ModeScreen />, [...ready]);

    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(screen.queryByRole('radio', { name: 'Voiture' })).toBeNull();
  });

  test('choosing another mode updates the legs', async () => {
    await renderWithProviders(<ModeScreen />, [...ready]);

    await fireEvent.press(screen.getByRole('radio', { name: 'À pied' }));

    expect(screen.getByRole('radio', { name: 'À pied' })).toBeChecked();
    expect(screen.queryByText('41')).toBeNull();
  });

  test('continues to the summary', async () => {
    await renderWithProviders(<ModeScreen />, [...ready]);

    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }));

    expect(router.push).toHaveBeenCalledWith('/summary');
  });
});
