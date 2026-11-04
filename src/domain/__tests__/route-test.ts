import { readRoute } from '../route';
import plan from './fixtures-marseille-plan.json';

describe('readRoute (spec 021)', () => {
  test('reads a real Marseille answer: walk, bus 55, walk, metro M1, walk', () => {
    const legs = readRoute(plan, 'transit');

    expect(legs?.map((leg) => leg.kind)).toEqual(['walk', 'bus', 'walk', 'metro', 'walk']);
    const bus = legs?.[1];
    expect(bus).toMatchObject({
      kind: 'bus',
      minutes: 6,
      from: 'Petit Chantier',
      to: 'Vieux-Port',
      direction: 'Joliette',
      via: ['Place de la Corderie', 'Fort Notre Dame', 'Place aux Huiles'],
      line: { id: '55', color: '#f59c00', textColor: '#000000', shape: 'square' },
    });
    expect(legs?.[3]).toMatchObject({ kind: 'metro', line: { id: 'M1', shape: 'pill' } });
    const [lng, lat] = legs?.[0]?.path[0] ?? [0, 0];
    expect(lng).toBeCloseTo(5.3685, 2);
    expect(lat).toBeCloseTo(43.2879, 2);
  });

  test('a leg it cannot read drops the whole itinerary, never half a trip', () => {
    const broken = structuredClone(plan);
    const legs = broken.itineraries[0]?.legs ?? [];
    if (legs[1]) legs[1].mode = 'SPACESHIP';

    expect(readRoute(broken, 'transit')).toBeUndefined();
  });

  test('malformed answers give no route', () => {
    expect(readRoute(null, 'transit')).toBeUndefined();
    expect(readRoute({ itineraries: 'x' }, 'transit')).toBeUndefined();
    expect(
      readRoute({ direct: [{ legs: [{ mode: 'WALK', duration: -1 }] }] }, 'direct'),
    ).toBeUndefined();
  });

  test('a bad colour falls back to a neutral one', () => {
    const odd = structuredClone(plan);
    const leg = odd.itineraries[0]?.legs[1];
    if (leg) leg.routeColor = 'red;background:url(x)';

    const bus = readRoute(odd, 'transit')?.[1];
    expect(bus?.kind === 'bus' && bus.line.color).toBe('#3A3B37');
  });

  test('a route that does not join the asked points is refused', () => {
    const start = readRoute(plan, 'transit')?.[0]?.path[0];
    const end = readRoute(plan, 'transit')?.at(-1)?.path.at(-1);
    if (!start || !end) throw new Error('fixture without a path');

    expect(readRoute(plan, 'transit', start, end)).toBeDefined();
    expect(readRoute(plan, 'transit', [2.35, 48.85], end)).toBeUndefined();
  });

  test('names lose control and direction characters', () => {
    const odd = structuredClone(plan);
    const leg = odd.itineraries[0]?.legs[1];
    if (leg?.to) leg.to.name = 'Vieux\u202e-Port';

    const bus = readRoute(odd, 'transit')?.[1];
    expect(bus?.kind === 'bus' && bus.to).toBe('Vieux-Port');
  });
});
