import { isCataloguePictogram } from './pictograms';
import type { Place } from './place';

// Spec 015: the traveller's places, kept in one file in the app's private storage. The
// file is read back as untrusted input (docs/engineering/securite.md): a damaged entry is
// dropped, never trusted.

/** Version of the file format; a file of another version is not read. */
export const STORED_PLACES_VERSION = 1;

/** Larger files are neither written nor read: a few hundred places weigh far less. */
export const MAX_STORED_PLACES_CHARS = 512 * 1024;

export type DecodedPlaces = { ok: true; places: Place[] } | { ok: false };

const MAX_ID_LENGTH = 64;
const MAX_HELP_NAME_LENGTH = 200;

/**
 * What the file keeps of a place. No photo yet (spec 015): photos come with their own
 * spec, stored as separate files.
 */
type StoredPlace = {
  id: string;
  icon: string;
  point?: [number, number];
  helpName?: string;
  hiddenOnMap?: boolean;
  createdAt: number;
};

/** The file's text for these places, oldest first. */
export function encodePlaces(places: readonly Place[]): string {
  const stored = places.map((place): StoredPlace => ({
    id: place.id,
    icon: place.icon,
    point: place.point ? [place.point[0], place.point[1]] : undefined,
    helpName: place.helpName,
    hiddenOnMap: place.hiddenOnMap,
    createdAt: place.createdAt ?? 0,
  }));
  return JSON.stringify({ version: STORED_PLACES_VERSION, places: stored });
}

/**
 * The places of a file, oldest first. A damaged file, or one of another version, is not
 * read at all (`ok: false`): the caller tries another copy. A damaged entry is skipped and
 * the others are kept.
 */
export function decodePlaces(text: string): DecodedPlaces {
  if (text.length > MAX_STORED_PLACES_CHARS) return { ok: false };
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    // A damaged file is reported, never trusted (spec 015).
    return { ok: false };
  }
  if (!isRecord(data) || data.version !== STORED_PLACES_VERSION || !Array.isArray(data.places)) {
    return { ok: false };
  }
  const places = data.places.flatMap((entry: unknown): Place[] => {
    const place = decodePlace(entry);
    return place ? [place] : [];
  });
  const unique = places.filter(
    (place, index) => places.findIndex((other) => other.id === place.id) === index,
  );
  return { ok: true, places: unique.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)) };
}

function decodePlace(entry: unknown): Place | undefined {
  if (!isRecord(entry)) return undefined;
  const { id, icon, point, helpName, hiddenOnMap, createdAt } = entry;
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]+$/.test(id) || id.length > MAX_ID_LENGTH) {
    return undefined;
  }
  if (typeof icon !== 'string') return undefined;
  if (typeof createdAt !== 'number' || !Number.isFinite(createdAt) || createdAt < 0) {
    return undefined;
  }
  if (point !== undefined && !isLngLat(point)) return undefined;
  if (
    helpName !== undefined &&
    (typeof helpName !== 'string' || helpName.length > MAX_HELP_NAME_LENGTH)
  ) {
    return undefined;
  }
  if (hiddenOnMap !== undefined && typeof hiddenOnMap !== 'boolean') return undefined;

  return {
    id,
    // A pictogram from a newer version becomes « autre lieu » (spec 011).
    icon: isCataloguePictogram(icon) ? icon : 'push_pin',
    point: point === undefined ? undefined : [point[0], point[1]],
    helpName,
    hiddenOnMap,
    createdAt,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLngLat(value: unknown): value is [number, number] {
  if (!Array.isArray(value) || value.length !== 2) return false;
  const lng: unknown = value[0];
  const lat: unknown = value[1];
  return (
    typeof lng === 'number' &&
    typeof lat === 'number' &&
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    Math.abs(lng) <= 180 &&
    Math.abs(lat) <= 90
  );
}
