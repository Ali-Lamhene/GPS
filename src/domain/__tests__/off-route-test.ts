import {
  farFromAlert,
  isBackOnRoute,
  isLost,
  isOffRoute,
  ON_ROUTE,
  trackOffRoute,
} from '../off-route';
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
    expect(isOffRoute([WALK], 0, [5.375, 43.29005])).toBe(false);
    expect(isOffRoute([WALK], 0, [5.375, 43.2909])).toBe(true);
  });

  test('on a bus, never off the way', () => {
    expect(isOffRoute([WALK, BUS], 1, [5.0, 43.0])).toBe(false);
  });

  test('near the next leg counts as on the way', () => {
    expect(isOffRoute([WALK, BUS], 0, [5.39, 43.295])).toBe(false);
  });

  test('off the way beyond 15 m, back on it within 10 m (spec 032)', () => {
    // 0.0001° of latitude is about 11 m.
    expect(isOffRoute([WALK], 0, [5.375, 43.29012])).toBe(false);
    expect(isOffRoute([WALK], 0, [5.375, 43.29015])).toBe(true);
    expect(isBackOnRoute([WALK], 0, [5.375, 43.2901])).toBe(false);
    expect(isBackOnRoute([WALK], 0, [5.375, 43.29008])).toBe(true);
  });

  test('lost at once on the second point off in a row, with no wait', () => {
    const one = trackOffRoute(ON_ROUTE, true);
    expect(isLost(one)).toBe(false);
    expect(isLost(trackOffRoute(one, true))).toBe(true);
  });

  test('one point back on the way starts again', () => {
    let track = trackOffRoute(ON_ROUTE, true);
    track = trackOffRoute(track, false);
    track = trackOffRoute(track, true);
    expect(isLost(track)).toBe(false);
  });

  test('a new trip only beyond 30 m as the crow flies from the alert', () => {
    const alertAt: [number, number] = [5.375, 43.291];
    expect(farFromAlert(alertAt, [5.375, 43.29125])).toBe(false);
    expect(farFromAlert(alertAt, [5.375, 43.2913])).toBe(true);
  });
});
