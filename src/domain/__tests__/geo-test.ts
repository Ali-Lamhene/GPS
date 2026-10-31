import {
  bearing,
  bearingAlong,
  distanceMeters,
  pathLength,
  pathsBounds,
  pointAlong,
  type LngLat,
} from '../geo';

// Two points 0.01° of latitude apart in Marseille: about 1.11 km.
const south: LngLat = [5.37, 43.29];
const north: LngLat = [5.37, 43.3];
const northEast: LngLat = [5.38, 43.3];

describe('geo', () => {
  test('measures distances in metres', () => {
    expect(distanceMeters(south, north)).toBeCloseTo(1112, 0);
    expect(pathLength([south, north, northEast])).toBeCloseTo(1112 + 809, -1);
  });

  test('gives bearings clockwise from north', () => {
    expect(bearing(south, north)).toBeCloseTo(0);
    expect(bearing(north, northEast)).toBeCloseTo(90, 0);
    expect(bearing(north, south)).toBeCloseTo(180);
  });

  test('finds the point and the direction along a path', () => {
    const path = [south, north, northEast];
    const halfway = pointAlong(path, 0.5);

    expect(halfway?.[0]).toBeCloseTo(5.37, 4);
    expect(bearingAlong(path, 0.2)).toBeCloseTo(0);
    expect(bearingAlong(path, 0.9)).toBeCloseTo(90, 0);
    expect(pointAlong(path, 0)).toEqual(south);
    expect(pointAlong(path, 1)).toEqual(northEast);
  });

  test('handles degenerate paths', () => {
    expect(pointAlong([], 0.5)).toBeUndefined();
    expect(pointAlong([south], 0.5)).toEqual(south);
    expect(bearingAlong([south], 0.5)).toBe(0);
    expect(pathLength([])).toBe(0);
  });
});

describe('pathsBounds', () => {
  test('frames every point of every path', () => {
    expect(pathsBounds([[south, north], [northEast]])).toEqual([
      [5.37, 43.29],
      [5.38, 43.3],
    ]);
    expect(pathsBounds([])).toBeUndefined();
    expect(pathsBounds([[]])).toBeUndefined();
  });
});
