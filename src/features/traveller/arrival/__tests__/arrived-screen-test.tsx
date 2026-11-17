import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Vibration } from 'react-native';

import { DEMO_PHOTOS } from '@/testing/fixtures/photos';
import { renderWithProviders } from '@/testing/render-with-providers';

import { ArrivedScreen } from '../arrived-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), dismissTo: jest.fn() } }));

const mockTripMap = jest.fn((_props: object) => null);
jest.mock('@/ui/map/trip-map', () => ({
  TripMap: (props: object) => mockTripMap(props),
}));

const to = (placeId: string) =>
  [
    { type: 'chooseOrigin', placeId: 'home' },
    { type: 'chooseDestination', placeId },
  ] as const;

function destinationProp() {
  return (mockTripMap.mock.calls.at(-1)?.[0] as { destination?: { icon: string; photo?: string } })
    .destination;
}

describe('<ArrivedScreen />', () => {
  beforeAll(() => jest.spyOn(Vibration, 'vibrate').mockImplementation(() => undefined));
  beforeEach(() => mockTripMap.mockClear());

  test('celebrates with the arrival vibration and leads back home', async () => {
    await renderWithProviders(<ArrivedScreen />);

    expect(Vibration.vibrate).toHaveBeenCalledWith([0, 60, 40, 60, 40, 200]);

    await fireEvent.press(screen.getByRole('button', { name: 'Accueil' }));
    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });

  test('the arrival pin on the map carries the photo of the place reached (spec 036)', async () => {
    await renderWithProviders(<ArrivedScreen />, [...to('school')]);

    expect(destinationProp()).toMatchObject({ icon: 'school', photo: DEMO_PHOTOS.school });
  });

  test('a place without a photo keeps its pictogram on the arrival pin', async () => {
    await renderWithProviders(<ArrivedScreen />, [...to('beach')]);

    expect(destinationProp()?.icon).toBe('beach_access');
    expect(destinationProp()?.photo).toBeUndefined();
  });

  test('the large disc shows the photo of the place reached (spec 036)', async () => {
    await renderWithProviders(<ArrivedScreen />, [...to('school')]);

    expect(JSON.stringify(screen.toJSON())).toContain(DEMO_PHOTOS.school.slice(0, 60));
  });
});
