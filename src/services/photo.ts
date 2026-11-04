import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { launchImageLibraryAsync } from 'expo-image-picker';

import type { PhotoNames } from '@/domain/stored-places';

// Spec 020: the photo of a place, kept in the app's private documents (out of every backup,
// spec 016). Re-encoded before it is kept, which drops its metadata, the position included.
// The copies the camera, the picker and the re-encoding leave in the cache are deleted.

const PHOTOS = 'photos';
/** Wide enough for a tile and a full screen, light on a small phone. */
const WIDTH = 1080;
const QUALITY = 0.8;
/** Where the camera, the picker and the re-encoding leave their copies. */
const CACHE_FOLDERS = ['Camera', 'ImagePicker', 'ImageManipulator'];
/** The name of a kept photo; the file keeps the name only (spec 020). */
const NAME = /^[a-z0-9]{1,16}\.jpg$/;

const photosFolder = () => new Directory(Paths.document, PHOTOS);

function deleteQuietly(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Already gone.
  }
}

/** The local address of a kept photo from its name; undefined for any other name. */
export function photoUri(name: string): string | undefined {
  return NAME.test(name) ? new File(photosFolder(), name).uri : undefined;
}

/** The name of a kept photo from its address; undefined if it is not one of the app's. */
export function photoName(uri: string): string | undefined {
  const name = uri.slice(uri.lastIndexOf('/') + 1);
  return photoUri(name) === uri ? name : undefined;
}

/** How the places file names the kept photos (spec 020). */
export const PHOTO_NAMES: PhotoNames = { toName: photoName, toUri: photoUri };

/** Empties the cache copies: one may still hold the original photo with its position. */
export function clearPhotoCache(): void {
  for (const name of CACHE_FOLDERS) {
    try {
      const folder = new Directory(Paths.cache, name);
      if (folder.exists) folder.delete();
    } catch {
      // Nothing left to clear.
    }
  }
}

/** A photo chosen in the system picker (no permission needed), or undefined. */
export async function pickPhoto(): Promise<string | undefined> {
  try {
    const result = await launchImageLibraryAsync({ mediaTypes: ['images'], exif: false });
    return result.canceled ? undefined : result.assets[0]?.uri;
  } catch {
    return undefined;
  }
}

/**
 * Keeps a photo for a place: re-encoded as a JPEG without metadata, in the app's private
 * documents. Only ever given a local file (camera or picker), never an address from a link.
 */
export async function keepPhoto(source: string): Promise<string | undefined> {
  if (!source.startsWith('file://')) return undefined;
  let encoded: string | undefined;
  try {
    const image = await ImageManipulator.manipulate(source).resize({ width: WIDTH }).renderAsync();
    encoded = (await image.saveAsync({ format: SaveFormat.JPEG, compress: QUALITY })).uri;
    const folder = photosFolder();
    if (!folder.exists) folder.create({ intermediates: true });
    const name = `${Math.random().toString(36).slice(2, 12)}.jpg`;
    const kept = new File(folder, name);
    new File(encoded).moveSync(kept);
    return kept.uri;
  } catch {
    if (encoded) deleteQuietly(encoded);
    return undefined;
  } finally {
    deleteQuietly(source);
  }
}

/** Deletes a kept photo; any address outside the app's photos folder is ignored. */
export function deletePhoto(uri: string): void {
  if (photoName(uri)) deleteQuietly(uri);
}

/** Deletes the kept photos no place uses any more (a save that failed, a place left). */
export function deleteOrphanPhotos(used: readonly string[]): void {
  try {
    const folder = photosFolder();
    if (!folder.exists) return;
    for (const entry of folder.list()) {
      if (entry instanceof File && !used.includes(entry.uri)) deleteQuietly(entry.uri);
    }
  } catch {
    // Best effort: tried again at the next start.
  }
}
