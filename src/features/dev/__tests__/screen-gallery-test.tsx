import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { renderWithProviders } from '@/testing/render-with-providers';

import { ScreenGallery } from '../screen-gallery';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

describe('<ScreenGallery />', () => {
  test('opens a screen with its trip set up', async () => {
    await renderWithProviders(<ScreenGallery />);

    await fireEvent.press(screen.getByText('21 Métro hors connexion'));

    expect(router.push).toHaveBeenCalledWith('/guidance');
  });

  test('lists the screens that open directly (sheets and later steps open from them)', async () => {
    await renderWithProviders(<ScreenGallery />);

    expect(screen.getAllByRole('button')).toHaveLength(25);
  });
});
