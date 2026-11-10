import { distanceMeters, locateOnPath, type LngLat } from './geo';
import type { Leg } from './trip';

// Specs 031 and 032: the traveller walks away from the trip. Seen at once when two points in
// a row lie off the walk being followed; a single GPS jump in a narrow street never triggers
// it. A new trip waits until they have gone on 30 m from where the alert came.

/** Farther than this from the walk, a point counts as off the way (spec 032). */
export const OFF_ROUTE_METERS = 15;
/** Off the way on this many points in a row, with no wait: the traveller is lost. */
const OFF_ROUTE_POINTS = 2;

/** Back on the way only this close, on two points in a row: no orange flicker at 15 m. */
export const BACK_ON_ROUTE_METERS = 10;
const BACK_POINTS = 2;

/** A new trip only once this far, as the crow flies, from where the alert came (spec 032). */
export const REROUTE_AFTER_METERS = 30;

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

/** Points off the way in a row. */
export type OffRouteTrack = { count: number };

export const ON_ROUTE: OffRouteTrack = { count: 0 };

/** The track after a new point, off the way or not. */
export function trackOffRoute(track: OffRouteTrack, off: boolean): OffRouteTrack {
  return off ? { count: track.count + 1 } : ON_ROUTE;
}

/** True once enough points in a row lie off the way: the alert comes at once. */
export function isLost(track: OffRouteTrack): boolean {
  return track.count >= OFF_ROUTE_POINTS;
}

/** Whether `point` lies far enough from where the alert came to ask for a new trip. */
export function farFromAlert(alertAt: LngLat, point: LngLat): boolean {
  return distanceMeters(alertAt, point) > REROUTE_AFTER_METERS;
}
