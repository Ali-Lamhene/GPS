import { isLost, isOffRoute, ON_ROUTE, trackOffRoute } from '../off-route';
import { DEMO_BUS_LEG } from '@/testing/fixtures/trips';

import type { Leg } from '../trip';

const WALK: Leg = {
  kind: 'walk',
  minutes: 5,
  path: [
    [5.37, 43.29],
    [5.38, 43.29],
  ],
};
const BUS: Leg = {
  ...DEMO_BUS_LEG,
  path: [
    [5.38, 43.29],
    [5.4, 43.3],
  ],
};

describe('off the way (spec 031)', () => {
  test('a point beside the walk is on it, one 100 m away is off', () => {
    expect(isOffRoute([WALK], 0, [5.375, 43.2902])).toBe(false);
    expect(isOffRoute([WALK], 0, [5.375, 43.2909])).toBe(true);
  });

  test('on a bus, never off the way', () => {
    expect(isOffRoute([WALK, BUS], 1, [5.0, 43.0])).toBe(false);
  });

  test('near the next leg counts as on the way', () => {
    expect(isOffRoute([WALK, BUS], 0, [5.39, 43.295])).toBe(false);
  });

  test('lost only after 10 s and three points off in a row', () => {
    let track = trackOffRoute(ON_ROUTE, true, 0);
    track = trackOffRoute(track, true, 4000);
    expect(isLost(track, 12_000)).toBe(false);
    track = trackOffRoute(track, true, 9000);
    expect(isLost(track, 9000)).toBe(false);
    expect(isLost(track, 10_000)).toBe(true);
  });

  test('one point back on the way starts again', () => {
    let track = trackOffRoute(ON_ROUTE, true, 0);
    track = trackOffRoute(track, true, 5000);
    track = trackOffRoute(track, false, 6000);
    track = trackOffRoute(track, true, 11_000);
    expect(isLost(track, 12_000)).toBe(false);
  });
});
