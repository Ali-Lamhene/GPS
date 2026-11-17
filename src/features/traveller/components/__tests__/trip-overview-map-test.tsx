import { render } from '@testing-library/react-native';

import { CURRENT_POSITION } from '@/domain/place';
import { DEMO_LEGS } from '@/testing/fixtures/trips';

import { TripOverviewMap } from '../trip-overview-map';

const mockTripMap = jest.fn((_props: object) => null);
jest.mock('@/ui/map/trip-map', () => ({
  TripMap: (props: object) => mockTripMap(props),
}));

const legs = DEMO_LEGS.transit;
const home = { id: 'home', icon: 'home', photo: 'file:///home.jpg' } as const;
const school = { id: 'school', icon: 'school', photo: 'file:///school.jpg' } as const;
const beach = { id: 'beach', icon: 'beach_access' } as const;

function lastProps() {
  return mockTripMap.mock.calls.at(-1)?.[0] as {
    origin?: { icon: string; photo?: string };
    destination?: { icon: string; photo?: string };
  };
}

describe('<TripOverviewMap /> photos (spec 036)', () => {
  beforeEach(() => mockTripMap.mockClear());

  test('start and arrival pins carry the photo of their place', async () => {
    await render(
      <TripOverviewMap legs={legs} origin={home} destination={school} top={0} bottom={0} />,
    );

    expect(lastProps().origin).toMatchObject({ icon: 'home', photo: 'file:///home.jpg' });
    expect(lastProps().destination).toMatchObject({ icon: 'school', photo: 'file:///school.jpg' });
  });

  test('a place without a photo keeps its pictogram', async () => {
    await render(
      <TripOverviewMap legs={legs} origin={beach} destination={beach} top={0} bottom={0} />,
    );

    expect(lastProps().origin?.photo).toBeUndefined();
    expect(lastProps().destination?.photo).toBeUndefined();
  });

  test('from « here » there is no start pin', async () => {
    await render(
      <TripOverviewMap
        legs={legs}
        origin={CURRENT_POSITION}
        destination={school}
        top={0}
        bottom={0}
      />,
    );

    expect(lastProps().origin).toBeUndefined();
  });
});
