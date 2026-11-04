import { useRef } from 'react';

import type { Place } from '@/domain/place';
import { encodePlaces, MAX_STORED_PLACES_CHARS } from '@/domain/stored-places';
import { writePlacesFile } from '@/services/place-storage';

import { useTripPlan } from './trip-plan-context';

/** A random id: neither derived from the place nor from the time it was made. */
export function newPlaceId(): string {
  const part = () => Math.random().toString(36).slice(2, 10).padEnd(8, '0');
  return `p${part()}${part()}`;
}

/**
 * Saves one more place on the phone, then keeps it in the app (spec 015). One save at a time:
 * a second call while the file is written is ignored and reports false.
 */
export function useSavePlace(): (
  place: Place,
  options?: { keepDraft?: boolean },
) => Promise<boolean> {
  const { customPlaces, dispatch } = useTripPlan();
  const saving = useRef(false);
  return async (place, options) => {
    if (saving.current) return false;
    saving.current = true;
    try {
      const text = encodePlaces([...customPlaces, place]);
      // A file too large would not be read back: refused like a full phone.
      const saved =
        text.length > MAX_STORED_PLACES_CHARS ? { ok: false } : await writePlacesFile(text);
      if (saved.ok) dispatch({ type: 'addPlace', place, keepDraft: options?.keepDraft });
      return saved.ok;
    } finally {
      saving.current = false;
    }
  };
}
