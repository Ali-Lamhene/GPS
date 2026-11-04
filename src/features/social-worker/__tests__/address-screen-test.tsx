import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { searchAddresses } from '@/services/address-search';
import { renderWithProviders } from '@/testing/render-with-providers';

import { AddressScreen } from '../address-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), dismissTo: jest.fn() } }));
jest.mock('@/services/address-search', () => ({ searchAddresses: jest.fn() }));

const PORT = {
  name: 'Pharmacie du Port',
  detail: '14 quai du Port, Marseille',
  point: [5.37, 43.29],
};

const type = (text: string) =>
  fireEvent.changeText(screen.getByLabelText('Adresse ou nom du lieu'), text);

describe('<AddressScreen /> (spec 001, 019)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('suggests addresses as the companion types, then keeps the picked one here', async () => {
    jest.mocked(searchAddresses).mockResolvedValue({ ok: true, results: [PORT] as never });
    await renderWithProviders(<AddressScreen />, [{ type: 'startPlace', source: 'address' }]);

    await type('pharmacie port');
    await fireEvent.press(await screen.findByText('Pharmacie du Port'));
    await fireEvent.press(screen.getByText('Garder sur ce téléphone'));

    expect(searchAddresses).toHaveBeenCalledWith(
      'pharmacie port',
      expect.anything(),
      expect.anything(),
    );
    expect(router.push).toHaveBeenCalledWith('/add-place/pictogram');
  });

  test('no network: says so in French', async () => {
    jest.mocked(searchAddresses).mockResolvedValue({ ok: false, reason: 'offline' });
    await renderWithProviders(<AddressScreen />, [{ type: 'startPlace', source: 'address' }]);

    await type('pharmacie');

    expect(await screen.findByText(/Pas de connexion/)).toBeOnTheScreen();
  });

  test('no result: says so', async () => {
    jest.mocked(searchAddresses).mockResolvedValue({ ok: true, results: [] });
    await renderWithProviders(<AddressScreen />, [{ type: 'startPlace', source: 'address' }]);

    await type('xyzxyz');

    expect(await screen.findByText(/Aucune adresse trouvée/)).toBeOnTheScreen();
  });
});
