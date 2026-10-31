import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { renderWithProviders } from '@/testing/render-with-providers';

import { HelpScreen } from '../help-screen';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

describe('<HelpScreen />', () => {
  test('before the trip starts, asks a passer-by for the destination', async () => {
    await renderWithProviders(<HelpScreen />, [
      { type: 'chooseOrigin', placeId: 'home' },
      { type: 'chooseDestination', placeId: 'beach' },
    ]);

    expect(screen.getByText(/je cherche la plage du Prado/)).toBeOnTheScreen();
  });

  test('during the guidance, adapts the message to the step', async () => {
    await renderWithProviders(<HelpScreen />, [{ type: 'goToStep', index: 4 }]);

    expect(screen.getByText(/le bus 41 en direction de Vieux Port Ballard/)).toBeOnTheScreen();
    expect(screen.getByText('41')).toBeOnTheScreen();
  });

  test('the message can be enlarged, and the card closed', async () => {
    await renderWithProviders(<HelpScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Agrandir' }));
    expect(screen.getByText(/je cherche ce lieu/)).toHaveStyle({ fontSize: 34 });

    await fireEvent.press(screen.getByRole('button', { name: 'Fermer' }));
    expect(router.back).toHaveBeenCalled();
  });
});
