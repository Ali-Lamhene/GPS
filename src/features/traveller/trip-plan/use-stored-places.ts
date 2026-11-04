import { useEffect, useState } from 'react';

import type { Place } from '@/domain/place';
import { decodePlaces } from '@/domain/stored-places';
import { clearImageDiskCache, deleteOrphanPhotos, PHOTO_NAMES } from '@/services/photo';
import { keepUnreadablePlacesFile, readPlacesFiles } from '@/services/place-storage';

export type StoredPlaces = { kind: 'loading' } | { kind: 'ready'; places: Place[] };

/**
 * The traveller's places read from the phone once, at start (spec 015): from the first copy
 * that reads whole. A file this version cannot read is kept aside before any save.
 */
export function useStoredPlaces(): StoredPlaces {
  const [stored, setStored] = useState<StoredPlaces>({ kind: 'loading' });
  useEffect(() => {
    let active = true;
    (async () => {
      // Pictures an older version left in the image disk cache (spec 022).
      clearImageDiskCache();
      const texts = await readPlacesFiles();
      const decoded = texts.map((text) => decodePlaces(text, PHOTO_NAMES));
      if (decoded[0]?.ok === false) await keepUnreadablePlacesFile();
      const whole = decoded.find((result) => result.ok);
      const places = whole?.ok ? whole.places : [];
      // Photos of no place (a save that failed, an app closed halfway): never left behind.
      if (whole?.ok) {
        deleteOrphanPhotos(places.flatMap((place) => (place.photo ? [place.photo] : [])));
      }
      if (active) setStored({ kind: 'ready', places });
    })();
    return () => {
      active = false;
    };
  }, []);
  return stored;
}
