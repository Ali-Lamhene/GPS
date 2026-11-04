import { router } from 'expo-router';
import { useRef, useState } from 'react';

import { encodePlaces, MAX_STORED_PLACES_CHARS } from '@/domain/stored-places';
import { playCue } from '@/services/feedback';
import { writePlacesFile } from '@/services/place-storage';

import { useTripPlan } from '../trip-plan/trip-plan-context';
import { placeFromDraft } from '../trip-plan/trip-plan-reducer';

/** A random id: neither derived from the place nor from the time it was made. */
function newPlaceId(): string {
  const part = () => Math.random().toString(36).slice(2, 10).padEnd(8, '0');
  return `p${part()}${part()}`;
}

/** Actions shared by the new place screens (E27-E30). */
export function usePlaceDraft() {
  const { draft, customPlaces, dispatch } = useTripPlan();
  // One save at a time: a second touch while the file is written does nothing (spec 015).
  const saving = useRef(false);
  const [busy, setBusy] = useState(false);
  return {
    draft,
    /** True while the place is being saved: the buttons that finish it stay inactive. */
    busy,
    cancel: () => {
      dispatch({ type: 'cancelPlace' });
      router.dismissTo('/');
    },
    /**
     * Saves the place on the phone, then returns home; the trip does not change (spec 007).
     * A place that cannot be saved is not kept at all: the home shows the error (spec 015).
     */
    finish: async (photo?: string) => {
      if (!draft || saving.current) return;
      saving.current = true;
      setBusy(true);
      const place = placeFromDraft(draft, { id: newPlaceId(), createdAt: Date.now(), photo });
      const text = encodePlaces([...customPlaces, place]);
      // A file too large would not be read back: refused like a full phone.
      const saved =
        text.length > MAX_STORED_PLACES_CHARS ? { ok: false } : await writePlacesFile(text);
      if (saved.ok) {
        dispatch({ type: 'addPlace', place });
        playCue('saved');
      } else {
        // The home plays the alert with the red cross, once it is in front (spec 015).
        dispatch({ type: 'placeSaveFailed' });
      }
      router.dismissTo('/');
    },
  };
}
