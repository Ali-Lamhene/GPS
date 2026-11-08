import { locateOnPath, type LngLat } from './geo';
import type { Leg } from './trip';

// Spec 031: the traveller walks away from the trip. Seen when every new point for a while
// lies far from the walk being followed; GPS noise in a narrow street never triggers it.

/** Farther than this from the walk, a point counts as off the way. */
export const OFF_ROUTE_METERS = 40;
/** Off the way for this long, on several points in a row: the traveller is lost. */
export const OFF_ROUTE_MS = 10_000;
const OFF_ROUTE_POINTS = 3;

/** Back on the way only this close, on two points in a row: no orange flicker at 40 m. */
export const BACK_ON_ROUTE_METERS = 25;
const BACK_POINTS = 2;

/**
 * How far `point` lies from the walk of `legIndex` or the next leg, in metres. Undefined
 * on a bus or in the metro: the vehicle keeps the way, only walks can go wrong.
 */
export function distanceFromWay(
  legs: readonly Leg[],
  legIndex: number,
  point: LngLat,
): number | undefined {
  const leg = legs[legIndex];
  if (!leg || leg.kind !== 'walk') return undefined;
  const distances = [leg, legs[legIndex + 1]].flatMap((each) => {
    const located = each ? locateOnPath(each.path, point) : undefined;
    return located ? [located.offMeters] : [];
  });
  return distances.length ? Math.min(...distances) : undefined;
}

/** Whether `point` lies far from the walk of `legIndex` and from the next leg. */
export function isOffRoute(legs: readonly Leg[], legIndex: number, point: LngLat): boolean {
  const distance = distanceFromWay(legs, legIndex, point);
  return distance !== undefined && distance > OFF_ROUTE_METERS;
}

/** Whether `point` is close enough to the way to count as back on it. */
export function isBackOnRoute(legs: readonly Leg[], legIndex: number, point: LngLat): boolean {
  const distance = distanceFromWay(legs, legIndex, point);
  return distance === undefined || distance <= BACK_ON_ROUTE_METERS;
}

/** Points back near the way in a row, while lost. */
export function backOnRoute(count: number): boolean {
  return count >= BACK_POINTS;
}

/** Points off the way in a row: when the first came, how many. */
export type OffRouteTrack = { since?: number; count: number };

export const ON_ROUTE: OffRouteTrack = { count: 0 };

/** The track after a new point, off the way or not, at `at` (ms). */
export function trackOffRoute(track: OffRouteTrack, off: boolean, at: number): OffRouteTrack {
  if (!off) return ON_ROUTE;
  return { since: track.since ?? at, count: track.count + 1 };
}

/** True once the traveller has been off the way long enough, on enough points. */
export function isLost(track: OffRouteTrack, now: number): boolean {
  return (
    track.since !== undefined &&
    track.count >= OFF_ROUTE_POINTS &&
    now - track.since >= OFF_ROUTE_MS
  );
}
