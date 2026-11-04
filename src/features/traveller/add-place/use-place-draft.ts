import { router } from 'expo-router';
import { useRef, useState } from 'react';

import { playCue } from '@/services/feedback';

import { useTripPlan } from '../trip-plan/trip-plan-context';
import { placeFromDraft } from '../trip-plan/trip-plan-reducer';
import { newPlaceId, useSavePlace } from '../trip-plan/use-save-place';

/** Actions shared by the new place screens (E27-E30). */
export function usePlaceDraft() {
  const { draft, dispatch } = useTripPlan();
  const savePlace = useSavePlace();
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
    finish: async (photo?: string): Promise<boolean> => {
      if (!draft || saving.current) return false;
      saving.current = true;
      setBusy(true);
      const place = placeFromDraft(draft, { id: newPlaceId(), createdAt: Date.now(), photo });
      const saved = await savePlace(place);
      if (saved) {
        playCue('saved');
      } else {
        // The home plays the alert with the red cross, once it is in front (spec 015).
        dispatch({ type: 'placeSaveFailed' });
      }
      router.dismissTo('/');
      return saved;
    },
  };
}
