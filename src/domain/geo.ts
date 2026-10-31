// Geometry on paths given as [longitude, latitude] points (GeoJSON order).

export type LngLat = readonly [longitude: number, latitude: number];

const EARTH_RADIUS_M = 6_371_008.8;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Great-circle distance in metres. */
export function distanceMeters([lon1, lat1]: LngLat, [lon2, lat2]: LngLat): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Initial bearing from a to b, in degrees clockwise from north (0 to 360). */
export function bearing([lon1, lat1]: LngLat, [lon2, lat2]: LngLat): number {
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function pathLength(path: readonly LngLat[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    if (a && b) total += distanceMeters(a, b);
  }
  return total;
}

/** Segment of the path that contains the point at `fraction` of its length, and where on it. */
function locate(path: readonly LngLat[], fraction: number) {
  const target = Math.min(1, Math.max(0, fraction)) * pathLength(path);
  let walked = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    if (!a || !b) continue;
    const length = distanceMeters(a, b);
    if (walked + length >= target || i === path.length - 1) {
      return { a, b, t: length === 0 ? 0 : Math.min(1, (target - walked) / length) };
    }
    walked += length;
  }
  return undefined;
}

/** Point at `fraction` (0 to 1) of the path's length. */
export function pointAlong(path: readonly LngLat[], fraction: number): LngLat | undefined {
  if (path.length === 1) return path[0];
  const found = locate(path, fraction);
  if (!found) return undefined;
  const { a, b, t } = found;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** Direction of travel at `fraction` of the path, in degrees clockwise from north. */
export function bearingAlong(path: readonly LngLat[], fraction: number): number {
  const found = locate(path, fraction);
  return found ? bearing(found.a, found.b) : 0;
}

/** Signed change of direction from one bearing to the next, between -180 and 180 (positive = right). */
export function turnAngle(fromBearing: number, toBearing: number): number {
  return ((toBearing - fromBearing + 540) % 360) - 180;
}

export type PathTurn = {
  /** Where the turn is, as a fraction of the path's length. */
  fraction: number;
  point: LngLat;
  direction: 'left' | 'right';
};

/**
 * Corners of a path where the direction changes by more than `minAngle` degrees: where a
 * walker must change street. Directions are taken `reach` metres before and after each
 * point, so small zigzags of the drawn path do not count, and close corners merge.
 */
export function findTurns(path: readonly LngLat[], minAngle = 50, reach = 15): PathTurn[] {
  const total = pathLength(path);
  if (total < 2 * reach) return [];
  const at = (metres: number) => pointAlong(path, metres / total);
  const turns: PathTurn[] = [];
  let walked = 0;
  for (let i = 1; i < path.length - 1; i++) {
    const previous = path[i - 1];
    const corner = path[i];
    if (!previous || !corner) continue;
    walked += distanceMeters(previous, corner);
    const before = at(walked - reach);
    const after = at(walked + reach);
    if (!before || !after || walked < reach || walked > total - reach) continue;
    const angle = turnAngle(bearing(before, corner), bearing(corner, after));
    if (Math.abs(angle) < minAngle) continue;
    const last = turns.at(-1);
    if (last && walked - last.fraction * total < 2 * reach) continue;
    turns.push({
      fraction: walked / total,
      point: corner,
      direction: angle > 0 ? 'right' : 'left',
    });
  }
  return turns;
}

/** The path split at `fraction`: the part already walked and the part still ahead. */
export function splitPath(
  path: readonly LngLat[],
  fraction: number,
): [done: LngLat[], ahead: LngLat[]] {
  const point = pointAlong(path, fraction);
  if (!point) return [[], [...path]];
  const target = Math.min(1, Math.max(0, fraction)) * pathLength(path);
  const done: LngLat[] = [];
  let walked = 0;
  let i = 0;
  for (; i < path.length; i++) {
    const current = path[i];
    if (!current) break;
    if (i > 0) {
      const previous = path[i - 1];
      if (previous) walked += distanceMeters(previous, current);
    }
    if (walked > target) break;
    done.push(current);
  }
  return [
    [...done, point],
    [point, ...path.slice(i)],
  ];
}

/** South-west and north-east corners of the box around all the given paths. */
export function pathsBounds(paths: readonly (readonly LngLat[])[]): [LngLat, LngLat] | undefined {
  const points = paths.flat();
  const first = points[0];
  if (!first) return undefined;
  let [west, south] = first;
  let [east, north] = first;
  for (const [lon, lat] of points) {
    west = Math.min(west, lon);
    east = Math.max(east, lon);
    south = Math.min(south, lat);
    north = Math.max(north, lat);
  }
  return [
    [west, south],
    [east, north],
  ];
}
