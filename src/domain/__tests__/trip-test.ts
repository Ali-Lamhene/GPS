import { isTransitLeg, totalMinutes, tripProgress, type Leg } from '../trip';

const line = { id: 'C3', color: '#1F5FBF', shape: 'square' } as const;
const legs: Leg[] = [
  { kind: 'walk', minutes: 10 },
  { kind: 'bus', minutes: 20, line, from: 'A', to: 'B', direction: 'C' },
  { kind: 'walk', minutes: 10 },
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

  test('isTransitLeg recognises bus and metro legs', () => {
    expect(legs.map(isTransitLeg)).toEqual([false, true, false]);
  });
});
