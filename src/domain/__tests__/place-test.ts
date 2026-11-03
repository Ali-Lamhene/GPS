import type { LngLat } from '../geo';
import {
  CURRENT_POSITION,
  hiddenOnMapByDefault,
  homeFraming,
  isLocalPicture,
  placeOrder,
  placesOnMap,
  type Place,
} from '../place';

const here: LngLat = [5.37, 43.29];
const near: LngLat = [5.38, 43.295];
const far: LngLat = [5.37, 43.26];

describe('placesOnMap', () => {
  const places: Place[] = [
    CURRENT_POSITION,
    { id: 'home', icon: 'home', point: near, hiddenOnMap: true },
    { id: 'school', icon: 'school', point: near },
    { id: 'work', icon: 'work' },
    { id: 'shop', icon: 'shopping_bag', point: far },
  ];

  test('keeps located places that are not hidden', () => {
    expect(placesOnMap(places).map((place) => place.id)).toEqual(['school', 'shop']);
  });

  test('a home that does not say whether to hide stays hidden', () => {
    const home: Place = { id: 'home-2', icon: 'home', point: near };

    expect(placesOnMap([home])).toEqual([]);
  });

  test('leaves out the start of the trip', () => {
    expect(placesOnMap(places, 'school').map((place) => place.id)).toEqual(['shop']);
  });
});

describe('hiddenOnMapByDefault', () => {
  test('hides home and family, shows the rest', () => {
    expect(hiddenOnMapByDefault('home')).toBe(true);
    expect(hiddenOnMapByDefault('family_home')).toBe(true);
    expect(hiddenOnMapByDefault('school')).toBe(false);
  });
});

describe('homeFraming', () => {
  test('frames the traveller and the places within 2 km only', () => {
    expect(homeFraming(here, [near, far])).toEqual([here, near]);
  });

  test('frames every place when the position is unknown', () => {
    expect(homeFraming(undefined, [near, far])).toEqual([
      [5.37, 43.26],
      [5.38, 43.295],
    ]);
  });

  test('frames nothing without position or place', () => {
    expect(homeFraming(undefined, [])).toBeUndefined();
  });
});

describe('isLocalPicture', () => {
  test.each(['file:///photo.jpg', 'blob:http://localhost/1', 'data:image/jpeg;base64,AA'])(
    'accepts %s',
    (uri) => expect(isLocalPicture(uri)).toBe(true),
  );

  test.each([
    'https://example.com/a.jpg',
    'http://example.com/a.jpg',
    '//example.com/a.jpg',
    'data:image/svg+xml;base64,AA',
    'javascript:alert(1)',
    ' file:///photo.jpg',
  ])('refuses %s', (uri) => expect(isLocalPicture(uri)).toBe(false));
});

describe('placeOrder', () => {
  const home: Place = { id: 'home', icon: 'home' };
  const beach: Place = { id: 'beach', icon: 'beach_access' };
  const school: Place = { id: 'school', icon: 'school' };

  test('position, then home, then the newest place first', () => {
    const first: Place = { id: 'custom-1', icon: 'work' };
    const second: Place = { id: 'custom-2', icon: 'park' };

    expect(
      placeOrder([CURRENT_POSITION, home, beach, school], [first, second]).map((p) => p.id),
    ).toEqual(['here', 'home', 'custom-2', 'custom-1', 'beach', 'school']);
  });

  test('a new home goes first too', () => {
    const newHome: Place = { id: 'custom-1', icon: 'home' };

    expect(placeOrder([beach], [newHome]).map((p) => p.id)).toEqual(['custom-1', 'beach']);
  });
});
