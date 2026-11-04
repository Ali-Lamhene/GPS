import { useEffect, useRef } from 'react';

import type { Place } from '@/domain/place';
import { encodePlaces, MAX_STORED_PLACES_CHARS } from '@/domain/stored-places';
import { deletePhoto, PHOTO_NAMES } from '@/services/photo';
import { dropPlacesBackup, writePlacesFile } from '@/services/place-storage';

import { useTripPlan } from './trip-plan-context';

/** A random id: neither derived from the place nor from the time it was made. */
export function newPlaceId(): string {
  const part = () => Math.random().toString(36).slice(2, 10).padEnd(8, '0');
  return `p${part()}${part()}`;
}

// One write at a time for the whole app (specs 015, 022): saves and deletions wait in line,
// each from the latest list, so none writes back a place another one just removed.
let queue: Promise<unknown> = Promise.resolve();
function inLine<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

/** The places of the phone as they are now, not as they were when a screen rendered. */
function useLatestPlaces(): () => readonly Place[] {
  const { customPlaces } = useTripPlan();
  const latest = useRef(customPlaces);
  useEffect(() => {
    latest.current = customPlaces;
  }, [customPlaces]);
  return () => latest.current;
}

/**
 * Deletes a place from the phone, with its photo (spec 001: the photo goes with the place),
 * and the backup copy that still held it. False when the file could not be written: the place
 * stays.
 */
export function useRemovePlace(): (placeId: string) => Promise<boolean> {
  const { dispatch } = useTripPlan();
  const places = useLatestPlaces();
  return (placeId) =>
    inLine(async () => {
      const all = places();
      const place = all.find((each) => each.id === placeId);
      if (!place) return false;
      const rest = all.filter((each) => each.id !== placeId);
      const saved = await writePlacesFile(encodePlaces(rest, PHOTO_NAMES));
      if (!saved.ok) return false;
      dispatch({ type: 'removePlace', placeId });
      if (place.photo) deletePhoto(place.photo);
      await dropPlacesBackup();
      return true;
    });
}

/**
 * Saves one more place on the phone, then keeps it in the app (spec 015). One save at a time:
 * a second call while the file is written waits for the first.
 */
export function useSavePlace(): (
  place: Place,
  options?: { keepDraft?: boolean },
) => Promise<boolean> {
  const { dispatch } = useTripPlan();
  const places = useLatestPlaces();
  return (place, options) =>
    inLine(async () => {
      const text = encodePlaces([...places(), place], PHOTO_NAMES);
      // A file too large would not be read back: refused like a full phone.
      const saved =
        text.length > MAX_STORED_PLACES_CHARS ? { ok: false } : await writePlacesFile(text);
      if (saved.ok) dispatch({ type: 'addPlace', place, keepDraft: options?.keepDraft });
      return saved.ok;
    });
}
