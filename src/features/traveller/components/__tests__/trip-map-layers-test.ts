import { DEMO_LEGS } from '@/testing/fixtures/trips';
import { tripLines, tripStops } from '../trip-map-layers';

const legs = DEMO_LEGS.transit;

describe('trip map layers', () => {
  test('before leaving, the whole trip is ahead', () => {
    expect(tripLines(legs).map((line) => line.style)).toEqual([
      'walk',
      'vehicle',
      'walk',
      'vehicle',
      'walk',
    ]);
  });

  test('on the way, legs behind are grey and the current one is cut in two', () => {
    const styles = tripLines(legs, { legIndex: 1, legFraction: 0.5 }).map((line) => line.style);

    expect(styles).toEqual(['done', 'done', 'vehicle', 'walk', 'vehicle', 'walk']);
  });

  test('marks where to get on and off the bus and the metro', () => {
    expect(tripStops(legs).map((stop) => stop.symbol)).toEqual([
      'directions_bus',
      'directions_bus',
      'metro',
      'metro',
    ]);
  });
});
