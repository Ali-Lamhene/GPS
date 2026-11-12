import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Image } from 'expo-image';
import { launchImageLibraryAsync } from 'expo-image-picker';

import type { PhotoNames } from '@/domain/stored-places';
import { streetPhotoCrop, type StreetPhoto } from '@/domain/street-photo';

// Spec 020: the photo of a place, kept in the app's private documents (out of every backup,
// spec 016). Re-encoded before it is kept, which drops its metadata, the position included.
// The copies the camera, the picker and the re-encoding leave in the cache are deleted.

const PHOTOS = 'photos';
/** Wide enough for a tile and a full screen, light on a small phone. */
const WIDTH = 1080;
const QUALITY = 0.8;
/** Where a street photo chosen for a place is written before it is re-encoded (spec 033). */
const STREET_PHOTO_CACHE = 'StreetPhoto';
/** Where the camera, the picker, the re-encoding and a chosen street photo leave copies. */
const CACHE_FOLDERS = ['Camera', 'ImagePicker', 'ImageManipulator', STREET_PHOTO_CACHE];
const DATA_JPEG = 'data:image/jpeg;base64,';
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

/** A fresh random name for a kept photo. */
const newName = () => `${Math.random().toString(36).slice(2, 12)}.jpg`;

/**
 * Keeps a photo for a place: re-encoded as a JPEG without metadata, in the app's private
 * documents. Only ever given a local file (camera or picker), never an address from a link.
 * `crop` reads the picture's size and returns the part to keep (spec 033).
 */
export async function keepPhoto(
  source: string,
  crop?: (width: number, height: number) => ReturnType<typeof streetPhotoCrop>,
): Promise<string | undefined> {
  if (!source.startsWith('file://')) return undefined;
  let encoded: string | undefined;
  try {
    let context = ImageManipulator.manipulate(source);
    if (crop) {
      const whole = await ImageManipulator.manipulate(source).renderAsync();
      const rect = crop(whole.width, whole.height);
      whole.release();
      context = context.crop(rect);
      if (rect.width > WIDTH) context = context.resize({ width: WIDTH });
    } else {
      context = context.resize({ width: WIDTH });
    }
    const image = await context.renderAsync();
    encoded = (await image.saveAsync({ format: SaveFormat.JPEG, compress: QUALITY })).uri;
    const folder = photosFolder();
    if (!folder.exists) folder.create({ intermediates: true });
    const kept = new File(folder, newName());
    new File(encoded).moveSync(kept);
    return kept.uri;
  } catch {
    if (encoded) deleteQuietly(encoded);
    return undefined;
  } finally {
    deleteQuietly(source);
  }
}

/**
 * Keeps a Panoramax street photo, held in memory as a `data:` JPEG, as a place's photo
 * (spec 033): written to the cache, cropped around the place, then kept like a photo taken.
 */
export async function keepStreetPhoto(photo: StreetPhoto): Promise<string | undefined> {
  if (!photo.url.startsWith(DATA_JPEG)) return undefined;
  let written: string | undefined;
  try {
    const binary = atob(photo.url.slice(DATA_JPEG.length));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const folder = new Directory(Paths.cache, STREET_PHOTO_CACHE);
    if (!folder.exists) folder.create({ intermediates: true });
    const file = new File(folder, newName());
    file.create();
    written = file.uri;
    await file.write(bytes);
  } catch {
    if (written) deleteQuietly(written);
    return undefined;
  }
  return keepPhoto(written, (width, height) => streetPhotoCrop(photo, width, height));
}

/** Deletes a kept photo; any address outside the app's photos folder is ignored. */
export function deletePhoto(uri: string): void {
  if (!photoName(uri)) return;
  deleteQuietly(uri);
  Image.clearMemoryCache().catch(() => false);
}

/** Copies the image library kept on disk in older versions: dropped once at start. */
export function clearImageDiskCache(): void {
  Image.clearDiskCache().catch(() => false);
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
