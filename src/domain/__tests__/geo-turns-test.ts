import { findTurns, pathLength, splitPath, turnAngle, type LngLat } from '../geo';

const a: LngLat = [5.37, 43.29];
const b: LngLat = [5.37, 43.3];
const right: LngLat = [5.38, 43.3];
const left: LngLat = [5.36, 43.3];

describe('turns', () => {
  test('turnAngle is positive to the right, negative to the left', () => {
    expect(turnAngle(0, 90)).toBe(90);
    expect(turnAngle(0, 270)).toBe(-90);
    expect(turnAngle(350, 10)).toBe(20);
  });

  test('findTurns ignores a zigzag shorter than its reach', () => {
    const zig: LngLat = [5.37005, 43.29502];
    expect(findTurns([a, [5.37, 43.295], zig, [5.37, 43.29504], b])).toEqual([]);
  });

  test('findTurns finds the corner and its side', () => {
    expect(findTurns([a, b, right])).toEqual([
      { fraction: expect.closeTo(1112 / 1921, 2), point: b, direction: 'right' },
    ]);
    expect(findTurns([a, b, left])[0]?.direction).toBe('left');
    expect(findTurns([a, b])).toEqual([]);
  });

  test('splitPath cuts the path where the traveller is', () => {
    const [done, ahead] = splitPath([a, b, right], 0.25);

    expect(done[0]).toEqual(a);
    expect(ahead.at(-1)).toEqual(right);
    expect(done.at(-1)).toEqual(ahead[0]);
    expect(pathLength(done) + pathLength(ahead)).toBeCloseTo(pathLength([a, b, right]), 0);
  });
});
