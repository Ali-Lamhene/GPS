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
