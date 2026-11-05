import { DEMO_LEGS } from '@/testing/fixtures/trips';
import { situationLayers } from '../help-situation-map';

const legs = DEMO_LEGS.transit;
const points = (layers: ReturnType<typeof situationLayers>) =>
  layers?.lines.flatMap((line) => line.path) ?? [];

describe('situationLayers', () => {
  test('walking to the bus stop: that walk and the stop, nothing further', () => {
    const layers = situationLayers(legs, { legIndex: 0, legFraction: 0.5 }, 'home');

    expect(layers?.stops).toEqual([expect.objectContaining({ symbol: 'directions_bus' })]);
    expect(layers?.stops[0]?.alight).toBeUndefined();
    expect(layers?.destination).toBeUndefined();
  });

  test('never draws the part already walked, which starts at the trip start', () => {
    const layers = situationLayers(legs, { legIndex: 0, legFraction: 0.5 }, 'home');

    expect(layers?.lines.every(({ style }) => style !== 'done')).toBe(true);
    expect(points(layers)).not.toContainEqual(legs[0]?.path[0]);
  });

  test('never draws the trip end before its last stretch', () => {
    const end = legs.at(-1)?.path.at(-1);

    for (const legIndex of [0, 1, 2, 3]) {
      const layers = situationLayers(legs, { legIndex, legFraction: 0.5 }, 'home');
      expect(layers?.destination).toBeUndefined();
      expect(points(layers)).not.toContainEqual(end);
    }
  });

  test('on the last stretch, the place to find is shown', () => {
    const layers = situationLayers(legs, { legIndex: 4, legFraction: 0.2 }, 'home');

    expect(layers?.destination).toEqual({ point: legs.at(-1)?.path.at(-1), icon: 'home' });
  });

  test('before leaving, only the first leg', () => {
    const layers = situationLayers(legs, undefined, 'home');

    expect(layers?.traveller).toEqual(legs[0]?.path[0]);
    expect(points(layers)).not.toContainEqual(legs[1]?.path.at(-1));
  });
});
