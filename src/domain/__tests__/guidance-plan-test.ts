import { locateOnPath } from '../geo';
import { buildGuidance, stepAt } from '../guidance-plan';
import { readRoute } from '../route';
import plan from './fixtures-marseille-plan.json';

const legs = readRoute(plan, 'transit') ?? [];

describe('buildGuidance (spec 021)', () => {
  const steps = buildGuidance(legs, 'la gare');

  test('walk, reach the stop, wait, ride, get off soon, got off… then the destination', () => {
    const kinds = steps.map((step) => step.instruction.kind);
    expect(kinds[0]).toBe('walk');
    expect(kinds).toContain('reachStop');
    expect(kinds.slice(kinds.indexOf('waitVehicle'), kinds.indexOf('waitVehicle') + 4)).toEqual([
      'waitVehicle',
      'ride',
      'getOffSoon',
      'gotOff',
    ]);
    expect(kinds).toContain('leaveStation');
    expect(kinds.at(-1)).toBe('walkToDestination');
  });

  test('steps go forward along the trip', () => {
    const order = steps.map((step) => step.legIndex + step.legFraction);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  test('the help before the bus asks for the stop, at the end for the place', () => {
    expect(steps[0]?.help.kind).toBe('findStop');
    expect(steps.at(-1)?.help).toEqual({ kind: 'findPlace', placeName: 'la gare' });
  });
});

describe('locateOnPath and stepAt', () => {
  const path = [
    [5.37, 43.29],
    [5.38, 43.29],
  ] as const;

  test('a point beside the middle of a street is half-way, a few metres off', () => {
    const located = locateOnPath(path, [5.375, 43.2901]);
    expect(located?.fraction).toBeCloseTo(0.5, 2);
    expect(located?.offMeters).toBeLessThan(15);
  });

  test('the guidance moves on with the position, never back, never from far off the path', () => {
    const steps = buildGuidance(legs);
    const firstLeg = legs[0]?.path ?? [];
    const end = firstLeg.at(-1);
    if (!end) throw new Error('fixture without a path');

    const reached = stepAt(steps, legs, 0, end);
    expect(reached).toBeGreaterThan(0);
    // At the stop: wait for the bus.
    expect(steps[reached ?? 0]?.instruction.kind).toBe('waitVehicle');
    expect(stepAt(steps, legs, reached ?? 0, firstLeg[0] ?? end)).toBeUndefined();
    expect(stepAt(steps, legs, 0, [2.35, 48.85])).toBeUndefined();
  });
});

describe('turn steps (spec 021)', () => {
  // An L-shaped street: 200 m east, then 200 m north.
  const path = [
    [5.37, 43.29],
    [5.37247, 43.29],
    [5.37247, 43.2918],
  ] as const;
  const steps = buildGuidance([{ kind: 'walk', minutes: 5, path }]);

  test('the turn comes about 35 m before the corner, then straight on again after it', () => {
    const kinds = steps.map((step) => step.instruction.kind === 'walk' && step.instruction.turn);
    expect(kinds.slice(0, 3)).toEqual(['straight', 'left', 'straight']);
    const turn = steps[1]?.legFraction ?? 0;
    expect(turn).toBeGreaterThan(0.38);
    expect(turn).toBeLessThan(0.5);
    expect(steps[2]?.legFraction).toBeGreaterThan(0.5);
  });

  test('the walk to the destination comes after the last turn', () => {
    const last = steps.at(-1);
    expect(last?.instruction.kind).toBe('walkToDestination');
    expect(last?.legFraction).toBeGreaterThanOrEqual(0.8);
  });
});
