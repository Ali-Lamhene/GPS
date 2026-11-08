import { isCataloguePictogram } from './pictograms';
import { clean } from './address';
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
 * What the file keeps of a place. The photo is a separate file of the app's documents
 * (spec 020): only its name is kept here, the address is rebuilt on the phone (it changes
 * on an iPhone at every update).
 */
type StoredPlace = {
  id: string;
  icon: string;
  photo?: string;
  point?: [number, number];
  helpName?: string;
  address?: string;
  hiddenOnMap?: boolean;
  createdAt: number;
};

/** Turns a photo's local address into the name kept in the file, and back. */
export type PhotoNames = {
  toName: (uri: string) => string | undefined;
  toUri: (name: string) => string | undefined;
};

/** The file's text for these places, oldest first. */
export function encodePlaces(places: readonly Place[], photos: PhotoNames): string {
  const stored = places.map((place): StoredPlace => ({
    id: place.id,
    icon: place.icon,
    photo: place.photo ? photos.toName(place.photo) : undefined,
    point: place.point ? [place.point[0], place.point[1]] : undefined,
    helpName: place.helpName,
    address: place.address,
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
export function decodePlaces(text: string, photos: PhotoNames): DecodedPlaces {
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
    const place = decodePlace(entry, photos);
    return place ? [place] : [];
  });
  const unique = places.filter(
    (place, index) => places.findIndex((other) => other.id === place.id) === index,
  );
  return { ok: true, places: unique.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)) };
}

function decodePlace(entry: unknown, photos: PhotoNames): Place | undefined {
  if (!isRecord(entry)) return undefined;
  const { id, icon, photo, point, helpName, address, hiddenOnMap, createdAt } = entry;
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
  // A damaged address drops the address, not the place (spec 029).
  const keptAddress =
    typeof address === 'string' && address.length <= MAX_HELP_NAME_LENGTH
      ? clean(address) || undefined
      : undefined;
  if (hiddenOnMap !== undefined && typeof hiddenOnMap !== 'boolean') return undefined;
  // A damaged photo address drops the photo, not the place.
  const keptPhoto = typeof photo === 'string' ? photos.toUri(photo) : undefined;

  return {
    id,
    // A pictogram from a newer version becomes « autre lieu » (spec 011).
    icon: isCataloguePictogram(icon) ? icon : 'push_pin',
    photo: keptPhoto,
    point: point === undefined ? undefined : [point[0], point[1]],
    helpName,
    address: keptAddress,
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
