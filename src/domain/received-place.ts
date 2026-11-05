import { distanceMeters, pathsBounds, type LngLat } from './geo';

/** Beyond this, the traveller and the place no longer fit one neighbourhood map. */
export const RECEIVED_FRAME_METERS = 3000;
const STREET_ZOOM = 16;

/**
 * Where the map of a received place looks (spec 023): the place in the middle, with the
 * traveller in the same frame when close enough to judge « do I know this spot? ».
 */
export function receivedPlaceCamera(
  place: LngLat,
  traveller: LngLat | undefined,
): { center: LngLat; zoom: number; bounds?: [LngLat, LngLat] } {
  const together =
    traveller && distanceMeters(place, traveller) <= RECEIVED_FRAME_METERS
      ? pathsBounds([[place, traveller]])
      : undefined;
  return together
    ? { center: place, zoom: STREET_ZOOM, bounds: together }
    : { center: place, zoom: STREET_ZOOM };
}
