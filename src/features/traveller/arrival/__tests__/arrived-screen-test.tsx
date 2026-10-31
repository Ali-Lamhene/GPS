import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Vibration } from 'react-native';

import { renderWithProviders } from '@/testing/render-with-providers';

import { ArrivedScreen } from '../arrived-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), dismissTo: jest.fn() } }));

describe('<ArrivedScreen />', () => {
  beforeAll(() => jest.spyOn(Vibration, 'vibrate').mockImplementation(() => undefined));

  test('celebrates with the arrival vibration and leads back home', async () => {
    await renderWithProviders(<ArrivedScreen />);

    expect(Vibration.vibrate).toHaveBeenCalledWith([0, 60, 40, 60, 40, 200]);

    await fireEvent.press(screen.getByRole('button', { name: 'Accueil' }));
    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });
});
