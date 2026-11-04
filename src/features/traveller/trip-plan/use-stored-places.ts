import { useEffect, useState } from 'react';

import type { Place } from '@/domain/place';
import { decodePlaces } from '@/domain/stored-places';
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
      const texts = await readPlacesFiles();
      const decoded = texts.map(decodePlaces);
      if (decoded[0]?.ok === false) await keepUnreadablePlacesFile();
      const whole = decoded.find((result) => result.ok);
      if (active) setStored({ kind: 'ready', places: whole?.ok ? whole.places : [] });
    })();
    return () => {
      active = false;
    };
  }, []);
  return stored;
}
