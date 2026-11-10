import { bearing, distanceMeters, type LngLat } from './geo';

// Spec 030: a street-level photo of the arrival, from Panoramax, so a traveller who cannot
// read recognises the building. The answer is untrusted input: anything odd is dropped.

export type StreetPhoto = {
  /**
   * The picture: read from Panoramax as an HTTPS address on an allowed host, then replaced
   * by the downloaded picture itself (`data:`), held in memory.
   */
  url: string;
  /** A 360° panorama, shown as the slice that faces the place. */
  panorama: boolean;
  /**
   * Where the place sits across the picture, from 0 (left edge) to 1 (right edge). For a
   * panorama, the slice is centred there.
   */
  centre: number;
};

/** Licences that allow showing the picture in the app, with a credit (spec 024). */
const LICENCES = ['etalab-2.0', 'CC-BY-SA-4.0', 'CC-BY-4.0', 'CC0'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function point(value: unknown): LngLat | undefined {
  if (!isRecord(value) || !Array.isArray(value.coordinates)) return undefined;
  const [lng, lat]: unknown[] = value.coordinates;
  if (typeof lng !== 'number' || typeof lat !== 'number') return undefined;
  if (Math.abs(lng) > 180 || Math.abs(lat) > 90) return undefined;
  return [lng, lat];
}

/** The picture's address, kept only on an allowed host, over HTTPS, as a JPEG. */
function pictureUrl(assets: unknown, hosts: readonly string[]): string | undefined {
  if (!isRecord(assets) || !isRecord(assets.sd) || typeof assets.sd.href !== 'string') {
    return undefined;
  }
  try {
    const url = new URL(assets.sd.href);
    const allowed =
      url.protocol === 'https:' &&
      hosts.includes(url.host) &&
      url.username === '' &&
      url.password === '' &&
      /\.jpe?g$/i.test(url.pathname);
    return allowed ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** -180 to 180: how far the place turns from the way the camera looked. */
function relative(angle: number): number {
  return ((((angle + 180) % 360) + 360) % 360) - 180;
}

/** How many pictures of a search answer are looked at, at most. */
export const STREET_PHOTO_CANDIDATES = 20;

/**
 * The nearest usable picture of a Panoramax search answer that shows `place`. Panoramax
 * does not sort its answer by distance: taking the first one showed a building 30 m away
 * while a nearer picture existed (field feedback, 2026-11-10).
 */
export function readStreetPhoto(
  data: unknown,
  place: LngLat,
  hosts: readonly string[],
): StreetPhoto | undefined {
  if (!isRecord(data) || !Array.isArray(data.features)) return undefined;
  const located = data.features.slice(0, STREET_PHOTO_CANDIDATES).flatMap((feature: unknown) => {
    if (!isRecord(feature) || !isRecord(feature.properties)) return [];
    const where = point(feature.geometry);
    return where ? [{ feature, where, meters: distanceMeters(where, place) }] : [];
  });
  located.sort((a, b) => a.meters - b.meters);
  for (const { feature, where } of located) {
    if (!isRecord(feature.properties)) continue;
    const p = feature.properties;
    const url = pictureUrl(feature.assets, hosts);
    const azimuth = p['view:azimuth'];
    if (!url || typeof azimuth !== 'number' || !Number.isFinite(azimuth)) continue;
    if (typeof p.license !== 'string' || !LICENCES.includes(p.license)) continue;
    const orientation = p['pers:interior_orientation'];
    const fov =
      isRecord(orientation) && typeof orientation.field_of_view === 'number'
        ? orientation.field_of_view
        : 70;
    const turn = relative(bearing(where, place) - azimuth);
    if (fov >= 360) return { url, panorama: true, centre: 0.5 + turn / 360 };
    // A flat picture must look at the place, not away from it.
    if (Math.abs(turn) > fov / 2) continue;
    return { url, panorama: false, centre: 0.5 + turn / fov };
  }
  return undefined;
}
