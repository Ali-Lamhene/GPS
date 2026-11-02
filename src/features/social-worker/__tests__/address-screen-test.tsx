import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { renderWithProviders } from '@/testing/render-with-providers';

import { AddressScreen } from '../address-screen';
import { matchAddresses } from '../demo/addresses';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), dismissTo: jest.fn() } }));

describe('matchAddresses', () => {
  test('matches the name or the address, ignoring case', () => {
    expect(matchAddresses('lilas').map((item) => item.name)).toEqual(['Centre de santé des Lilas']);
    expect(matchAddresses('')).toHaveLength(4);
  });
});

describe('<AddressScreen />', () => {
  test('typing filters the suggestions; picking one goes on to the pictogram', async () => {
    await renderWithProviders(<AddressScreen />, [{ type: 'startPlace', source: 'address' }]);

    await fireEvent.changeText(screen.getByPlaceholderText('Ex. 14 quai du Port'), 'port');
    expect(screen.queryByText('Chez Leïla')).toBeNull();

    await fireEvent.press(screen.getByText('Pharmacie du Port'));

    expect(router.push).toHaveBeenCalledWith('/add-place/pictogram');
  });
});
