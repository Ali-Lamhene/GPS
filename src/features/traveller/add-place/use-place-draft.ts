import { router } from 'expo-router';
import { useRef, useState } from 'react';

import { reverseAddress } from '@/services/address-search';
import { playCue } from '@/services/feedback';
import { deletePhoto } from '@/services/photo';

import { useTripPlan } from '../trip-plan/trip-plan-context';
import { placeFromDraft, placeFromEdit } from '../trip-plan/trip-plan-reducer';
import { newPlaceId, useSavePlace, useUpdatePlace } from '../trip-plan/use-save-place';

/** Actions shared by the new place screens (E27-E30). */
export function usePlaceDraft() {
  const { draft, dispatch } = useTripPlan();
  const savePlace = useSavePlace();
  const updatePlace = useUpdatePlace();
  // One save at a time: a second touch while the file is written does nothing (spec 015).
  const saving = useRef(false);
  // Cancelled while the address was asked: nothing is saved (spec 029).
  const cancelled = useRef(false);
  const [busy, setBusy] = useState(false);
  return {
    draft,
    /** True while the place is being saved: the buttons that finish it stay inactive. */
    busy,
    cancel: () => {
      cancelled.current = true;
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
      // A saved place changed (spec 037): same id, point and address; no address asked.
      const original = draft.editing;
      if (original) {
        const changed = placeFromEdit(original, draft, photo);
        const updated = await updatePlace(changed);
        if (updated) {
          // The old photo goes only once the new list is written (spec 037).
          if (original.photo && original.photo !== changed.photo) deletePhoto(original.photo);
          playCue('saved');
        } else {
          dispatch({ type: 'placeSaveFailed' });
        }
        router.dismissTo('/');
        return updated;
      }
      // No address yet (a pin or a photo here): asked once, for the help card (spec 029),
      // home included; not for a place sent by link (the traveller's phone asks it).
      const ask = !draft.address && draft.point && !draft.send;
      const address = ask && draft.point ? await reverseAddress(draft.point) : draft.address;
      if (cancelled.current) {
        saving.current = false;
        setBusy(false);
        return false;
      }
      const place = placeFromDraft(draft, {
        id: newPlaceId(),
        createdAt: Date.now(),
        photo,
        address,
      });
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
