import {
  isTransitLeg,
  remainingMinutes,
  totalMinutes,
  tripPosition,
  tripProgress,
  type Leg,
} from '../trip';

const line = { id: 'C3', color: '#1F5FBF', shape: 'square' } as const;
const legs: Leg[] = [
  {
    kind: 'walk',
    minutes: 10,
    path: [
      [5.37, 43.29],
      [5.37, 43.3],
    ],
  },
  { kind: 'bus', minutes: 20, line, from: 'A', to: 'B', via: [], direction: 'C', path: [] },
  { kind: 'walk', minutes: 10, path: [] },
];

describe('trip', () => {
  test('totalMinutes adds every leg', () => {
    expect(totalMinutes(legs)).toBe(40);
    expect(totalMinutes([])).toBe(0);
  });

  test('tripProgress places the traveller along the whole trip', () => {
    expect(tripProgress(legs, 0, 0)).toBe(0);
    expect(tripProgress(legs, 0, 0.5)).toBe(5 / 40);
    expect(tripProgress(legs, 1, 0.5)).toBe(20 / 40);
    expect(tripProgress(legs, 2, 1)).toBe(1);
  });

  test('tripProgress stays within bounds', () => {
    expect(tripProgress(legs, 1, 2)).toBe(30 / 40);
    expect(tripProgress(legs, 9, 1)).toBe(1);
    expect(tripProgress([], 0, 0.5)).toBe(0);
  });

  test('remainingMinutes counts down along the trip', () => {
    expect(remainingMinutes(legs, 0, 0)).toBe(40);
    expect(remainingMinutes(legs, 1, 0.5)).toBe(20);
    expect(remainingMinutes(legs, 2, 1)).toBe(0);
  });

  test('tripPosition places the traveller on the leg and faces the way to go', () => {
    const position = tripPosition(legs, 0, 0.5);

    expect(position?.point[1]).toBeCloseTo(43.295, 4);
    expect(position?.heading).toBeCloseTo(0);
    expect(tripPosition(legs, 1, 0.5)).toBeUndefined();
    expect(tripPosition(legs, 9, 0.5)).toBeUndefined();
  });

  test('isTransitLeg recognises bus and metro legs', () => {
    expect(legs.map(isTransitLeg)).toEqual([false, true, false]);
  });
});
