import { totalMinutes } from '@/domain/trip';

import { DEMO_GUIDANCE } from '../guidance';
import { DEMO_DESTINATION_IDS, DEMO_ORIGIN_IDS, DEMO_PLACES } from '../places';
import { DEMO_LEGS } from '../trips';

describe('demo data', () => {
  test('guidance steps point at existing legs, with time running down', () => {
    for (const mode of ['walk', 'transit', 'car'] as const) {
      const legs = DEMO_LEGS[mode];
      const steps = DEMO_GUIDANCE[mode];
      for (const step of steps) {
        expect(legs[step.legIndex]).toBeDefined();
        expect(step.remainingMinutes).toBeLessThanOrEqual(totalMinutes(legs));
      }
      const remaining = steps.map((step) => step.remainingMinutes);
      expect([...remaining].sort((a, b) => b - a)).toEqual(remaining);
    }
  });

  test('origins and destinations are known places', () => {
    const ids = DEMO_PLACES.map((place) => place.id);
    for (const id of [...DEMO_ORIGIN_IDS, ...DEMO_DESTINATION_IDS]) {
      expect(ids).toContain(id);
    }
  });
});
