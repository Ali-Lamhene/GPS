import { distanceMeters, type LngLat } from './geo';
import { decodePolyline } from './polyline';
import type { Leg, TransitLine } from './trip';

// Spec 021: a route answer of the routing service (MOTIS, Transitous) read into the legs
// the screens draw. The answer is untrusted input: anything malformed is dropped, names are
// cut short, colours are checked.

const MAX_NAME = 60;
const MAX_STOPS = 40;
const MAX_POINTS = 5000;
const MAX_ENCODED = 50_000;
const MAX_LEGS = 20;
const MAX_ITINERARIES = 5;
/** A trip must start and end this close to the points asked for, or it is not ours. */
const MAX_END_GAP_METERS = 400;

/** Network modes drawn as a bus (rounded square line id) or a metro or train (pill). */
const BUS_MODES = ['BUS', 'COACH', 'TRAM', 'FERRY', 'FUNICULAR', 'AERIAL_LIFT', 'CABLE_CAR'];
const RAIL_MODES = [
  'SUBWAY',
  'METRO',
  'SUBURBAN',
  'RAIL',
  'REGIONAL_RAIL',
  'REGIONAL_FAST_RAIL',
  'HIGHSPEED_RAIL',
  'LONG_DISTANCE',
  'NIGHT_RAIL',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function name(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  // No control or direction characters: a name read to a passer-by must read as it shows.
  const clean = value.replace(/[\p{Cc}\p{Cf}]/gu, '').trim();
  return clean.length > 0 ? clean.slice(0, MAX_NAME) : undefined;
}

function color(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^[0-9a-fA-F]{6}$/.test(value) ? `#${value}` : fallback;
}

function minutes(seconds: unknown): number | undefined {
  return typeof seconds === 'number' && Number.isFinite(seconds) && seconds >= 0
    ? Math.max(1, Math.round(seconds / 60))
    : undefined;
}

function path(geometry: unknown): readonly LngLat[] | undefined {
  if (!isRecord(geometry) || typeof geometry.points !== 'string') return undefined;
  if (geometry.points.length > MAX_ENCODED) return undefined;
  const precision = typeof geometry.precision === 'number' ? geometry.precision : 6;
  if (precision < 5 || precision > 7) return undefined;
  const points = decodePolyline(geometry.points, precision);
  if (points.length > MAX_POINTS) return undefined;
  const valid = points.every(([lng, lat]) => Math.abs(lng) <= 180 && Math.abs(lat) <= 90);
  return valid && points.length >= 2 ? points : undefined;
}

function readLeg(value: unknown): Leg | undefined {
  if (!isRecord(value) || typeof value.mode !== 'string') return undefined;
  const duration = minutes(value.duration);
  const shape = path(value.legGeometry);
  if (duration === undefined || !shape) return undefined;
  const { mode } = value;
  if (mode === 'WALK') return { kind: 'walk', minutes: duration, path: shape };
  const bus = BUS_MODES.includes(mode);
  if (!bus && !RAIL_MODES.includes(mode)) return undefined;
  const from = isRecord(value.from) ? name(value.from.name) : undefined;
  const to = isRecord(value.to) ? name(value.to.name) : undefined;
  const id = name(value.routeShortName) ?? name(value.displayName);
  if (!from || !to || !id) return undefined;
  const line: TransitLine = {
    id: id.slice(0, 8),
    color: color(value.routeColor, '#3A3B37'),
    textColor: color(value.routeTextColor, '#FFFFFF'),
    shape: bus ? 'square' : 'pill',
  };
  const via = Array.isArray(value.intermediateStops)
    ? value.intermediateStops.slice(0, MAX_STOPS).flatMap((stop: unknown) => {
        const stopName = isRecord(stop) ? name(stop.name) : undefined;
        return stopName ? [stopName] : [];
      })
    : [];
  return {
    kind: bus ? 'bus' : 'metro',
    minutes: duration,
    line,
    from,
    to,
    via,
    direction: name(value.headsign) ?? to,
    path: shape,
  };
}

function readItinerary(value: unknown): Leg[] | undefined {
  if (!isRecord(value) || !Array.isArray(value.legs)) return undefined;
  if (value.legs.length === 0 || value.legs.length > MAX_LEGS) return undefined;
  const legs = value.legs.map(readLeg);
  return legs.every((leg) => leg !== undefined) ? (legs as Leg[]) : undefined;
}

function joins(legs: readonly Leg[], from?: LngLat, to?: LngLat): boolean {
  const first = legs[0]?.path[0];
  const last = legs.at(-1)?.path.at(-1);
  if (!first || !last) return false;
  return (
    (!from || distanceMeters(first, from) <= MAX_END_GAP_METERS) &&
    (!to || distanceMeters(last, to) <= MAX_END_GAP_METERS)
  );
}

/**
 * The first readable route of an answer: the itineraries for a trip by network, the direct
 * routes for walking or driving. A route that does not start and end where asked is refused:
 * the app never guides somewhere else. Undefined when there is none.
 */
export function readRoute(
  data: unknown,
  kind: 'transit' | 'direct',
  from?: LngLat,
  to?: LngLat,
): Leg[] | undefined {
  if (!isRecord(data)) return undefined;
  const list = kind === 'transit' ? data.itineraries : data.direct;
  if (!Array.isArray(list)) return undefined;
  for (const itinerary of list.slice(0, MAX_ITINERARIES)) {
    const legs = readItinerary(itinerary);
    if (legs && joins(legs, from, to)) return legs;
  }
  return undefined;
}
