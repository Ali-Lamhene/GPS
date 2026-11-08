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

const MAX_ADDRESS = 200;

/**
 * The street address of a Photon reverse answer (spec 029): « 14 quai du Port, 13002
 * Marseille », or the place's name with its town when there is no street.
 */
export function readPhotonAddress(data: unknown): string | undefined {
  if (!isRecord(data) || !Array.isArray(data.features)) return undefined;
  const feature: unknown = data.features[0];
  if (!isRecord(feature) || !isRecord(feature.properties)) return undefined;
  const p = feature.properties;
  const street = [text(p.housenumber), text(p.street)].filter(Boolean).join(' ');
  const town = [text(p.postcode), text(p.city)].filter(Boolean).join(' ');
  const first = street || text(p.name);
  if (!first) return undefined;
  const address = clean([first, town].filter(Boolean).join(', '));
  return address ? address.slice(0, MAX_ADDRESS) : undefined;
}

/** No control or direction characters: the text is shown to a passer-by as it is. */
export function clean(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f-\u009f\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '')
    .trim();
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
      const street = clean([text(p.housenumber), text(p.street)].filter(Boolean).join(' '));
      const named = text(p.name);
      const name = (named && clean(named)) || street || undefined;
      if (!name) return [];
      const detail = clean(
        [name === street ? undefined : street, text(p.postcode), text(p.city)]
          .filter(Boolean)
          .join(', '),
      );
      return [{ name, detail, point: [lng, lat] }];
    })
    .slice(0, MAX_RESULTS);
}
