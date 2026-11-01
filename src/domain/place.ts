import { distanceMeters, pathsBounds, type LngLat } from './geo';

/** Pictograms a place can wear (Material Symbols names). */
export type PlaceIcon =
  | 'my_location'
  | 'home'
  | 'work'
  | 'location_city'
  | 'beach_access'
  | 'fitness_center'
  | 'shopping_bag'
  | 'school'
  | 'family_restroom'
  | 'local_hospital'
  | 'local_pharmacy'
  | 'shopping_cart'
  | 'restaurant'
  | 'park'
  | 'sports_soccer'
  | 'local_library'
  | 'favorite'
  | 'location_on';

export type Place = {
  id: string;
  icon: PlaceIcon;
  /** The traveller's own photo of the place, stored on the phone (local file URI). */
  photo?: string;
  /**
   * French name, only read by a passer-by on the help card (D9). Never shown to the
   * traveller as a label.
   */
  helpName?: string;
  /** Where the place is; a place without one has no pin on the map (spec 005). */
  point?: LngLat;
  /**
   * Kept off the home map, so that someone who sees the phone cannot spot it (spec 005).
   * Set by whoever creates the place; still offered in the place sheet.
   */
  hiddenOnMap?: boolean;
};

/** The traveller's current position, offered as a starting point. */
export const CURRENT_POSITION: Place = { id: 'here', icon: 'my_location', helpName: 'ma position' };

/** Pictograms offered when a place is created (E28). */
export const PICTOGRAM_CHOICES: readonly PlaceIcon[] = [
  'home',
  'family_restroom',
  'work',
  'school',
  'local_hospital',
  'local_pharmacy',
  'shopping_cart',
  'restaurant',
  'park',
  'sports_soccer',
  'local_library',
  'favorite',
];

/** Private places stay off the home map unless the person creating them says otherwise. */
export function hiddenOnMapByDefault(icon: PlaceIcon): boolean {
  return icon === 'home' || icon === 'family_restroom';
}

/**
 * Whether a place stays off the home map. A place that does not say, whatever created it,
 * follows the default for its pictogram: never shown by mistake.
 */
export function isHiddenOnMap(place: Place): boolean {
  return place.hiddenOnMap ?? hiddenOnMapByDefault(place.icon);
}

/**
 * Only pictures stored on the phone: a place's photo never makes the app fetch a web
 * address, which would tell its host when and from where the traveller opens the app.
 */
export function isLocalPicture(uri: string): boolean {
  return /^(file:|blob:|data:image\/(jpeg|png|webp);)/.test(uri);
}

/** Places drawn as pins on the home map: located, not hidden, and not already the start. */
export function placesOnMap(places: readonly Place[], startId?: string): Place[] {
  return places.filter(
    (place) =>
      place.point !== undefined &&
      !isHiddenOnMap(place) &&
      place.id !== CURRENT_POSITION.id &&
      place.id !== startId,
  );
}

/** How far around the traveller the home map looks for places to frame. */
export const NEARBY_METERS = 2000;

/**
 * What the home map frames first (spec 005): the traveller and their places nearby; all the
 * places when the position is unknown. Undefined when there is nothing to frame.
 */
export function homeFraming(
  position: LngLat | undefined,
  points: readonly LngLat[],
): [LngLat, LngLat] | undefined {
  const nearby = position
    ? [position, ...points.filter((point) => distanceMeters(position, point) <= NEARBY_METERS)]
    : points;
  return pathsBounds([nearby]);
}
