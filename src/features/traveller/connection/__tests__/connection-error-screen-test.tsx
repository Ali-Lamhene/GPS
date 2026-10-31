import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { renderWithProviders } from '@/testing/render-with-providers';

import { ConnectionErrorScreen } from '../connection-error-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

describe('<ConnectionErrorScreen />', () => {
  test('retrying or going back returns to the previous screen; help stays at hand', async () => {
    await renderWithProviders(<ConnectionErrorScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Réessayer' }));
    expect(router.back).toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Aide' }));
    expect(router.push).toHaveBeenCalledWith('/help');
  });
});
