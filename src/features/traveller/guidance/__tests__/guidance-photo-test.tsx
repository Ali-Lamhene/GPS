import { screen } from '@testing-library/react-native';

import { DEMO_PHOTOS } from '@/testing/fixtures/photos';
import { renderWithProviders } from '@/testing/render-with-providers';

import { GuidanceScreen } from '../guidance-screen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useFocusEffect: (effect: () => void) => jest.requireActual('react').useEffect(effect, [effect]),
  useIsFocused: () => true,
}));

const mockTripMap = jest.fn((_props: object) => null);
jest.mock('@/ui/map/trip-map', () => ({
  TripMap: (props: object) => mockTripMap(props),
}));

const trip = (placeId: string) =>
  [
    { type: 'chooseOrigin', placeId: 'home' },
    { type: 'chooseDestination', placeId },
    { type: 'chooseMode', mode: 'transit' },
    { type: 'goToStep', index: 0 },
  ] as const;

function destinationProp() {
  return (mockTripMap.mock.calls.at(-1)?.[0] as { destination?: { icon: string; photo?: string } })
    .destination;
}

describe('<GuidanceScreen /> photos (spec 036)', () => {
  beforeEach(() => mockTripMap.mockClear());

  test('the arrival pin of the map carries the photo of the place', async () => {
    await renderWithProviders(<GuidanceScreen />, [...trip('school')]);

    expect(destinationProp()).toMatchObject({ icon: 'school', photo: DEMO_PHOTOS.school });
  });

  test('the pill shows the photo of the arrival place', async () => {
    await renderWithProviders(<GuidanceScreen />, [...trip('school')]);

    expect(JSON.stringify(screen.toJSON())).toContain(DEMO_PHOTOS.school.slice(0, 60));
  });

  test('a place without a photo keeps its pictogram', async () => {
    await renderWithProviders(<GuidanceScreen />, [...trip('beach')]);

    expect(destinationProp()?.photo).toBeUndefined();
  });
});
