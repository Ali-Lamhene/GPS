import { distanceMeters } from '@/domain/geo';
import { remainingMinutes, tripPosition } from '@/domain/trip';

import { DEMO_GUIDANCE } from '../guidance';
import { DEMO_DESTINATION_IDS, DEMO_ORIGIN_IDS, DEMO_PLACES } from '../places';
import { DEMO_LEGS } from '../trips';

describe('demo data', () => {
  test('guidance steps sit on the real paths, with time running down', () => {
    for (const mode of ['walk', 'transit'] as const) {
      const legs = DEMO_LEGS[mode];
      const steps = DEMO_GUIDANCE[mode];
      for (const step of steps) {
        expect(tripPosition(legs, step.legIndex, step.legFraction)).toBeDefined();
      }
      const remaining = steps.map((step) =>
        remainingMinutes(legs, step.legIndex, step.legFraction),
      );
      expect([...remaining].sort((a, b) => b - a)).toEqual(remaining);
    }
  });

  test('each leg starts where the previous one ends, within a few metres', () => {
    for (const legs of Object.values(DEMO_LEGS)) {
      legs.slice(1).forEach((leg, i) => {
        const previousEnd = legs[i]?.path.at(-1);
        const start = leg.path[0];
        expect(previousEnd && start && distanceMeters(previousEnd, start)).toBeLessThan(25);
      });
    }
  });

  test('origins and destinations are known places', () => {
    const ids = DEMO_PLACES.map((place) => place.id);
    for (const id of [...DEMO_ORIGIN_IDS, ...DEMO_DESTINATION_IDS]) {
      expect(ids).toContain(id);
    }
  });
});
