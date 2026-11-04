import type { LngLat } from './geo';

// Spec 001 (B, C): an address found for the companion. Read from Photon's answer, which is
// untrusted input: anything malformed is dropped.

export type AddressResult = {
  /** The name of the place, or its street and number. */
  name: string;
  /** The rest of the address, to tell two results apart. */
  detail: string;
  point: LngLat;
};

const MAX_RESULTS = 6;
const MAX_TEXT = 120;

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value.slice(0, MAX_TEXT) : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** The addresses of a Photon GeoJSON answer, at most six. */
export function readPhotonResults(data: unknown): AddressResult[] {
  if (!isRecord(data) || !Array.isArray(data.features)) return [];
  return data.features
    .flatMap((feature: unknown): AddressResult[] => {
      if (!isRecord(feature) || !isRecord(feature.geometry) || !isRecord(feature.properties)) {
        return [];
      }
      const coordinates: unknown = feature.geometry.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length < 2) return [];
      const lng: unknown = coordinates[0];
      const lat: unknown = coordinates[1];
      if (
        typeof lng !== 'number' ||
        typeof lat !== 'number' ||
        Math.abs(lng) > 180 ||
        Math.abs(lat) > 90
      ) {
        return [];
      }
      const p = feature.properties;
      const street = [text(p.housenumber), text(p.street)].filter(Boolean).join(' ');
      const name = text(p.name) ?? (street || undefined);
      if (!name) return [];
      const detail = [name === street ? undefined : street, text(p.postcode), text(p.city)]
        .filter(Boolean)
        .join(', ');
      return [{ name, detail, point: [lng, lat] }];
    })
    .slice(0, MAX_RESULTS);
}
