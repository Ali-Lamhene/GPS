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
    expect(screen.getByText('C3')).toBeOnTheScreen();
    expect(screen.getByText('M1')).toBeOnTheScreen();
  });

  test('choosing another mode updates the legs', async () => {
    await renderWithProviders(<ModeScreen />, [...ready]);

    await fireEvent.press(screen.getByRole('radio', { name: 'À pied' }));

    expect(screen.getByRole('radio', { name: 'À pied' })).toBeChecked();
    expect(screen.queryByText('C3')).toBeNull();
  });

  test('continues to the summary', async () => {
    await renderWithProviders(<ModeScreen />, [...ready]);

    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }));

    expect(router.push).toHaveBeenCalledWith('/summary');
  });
});
