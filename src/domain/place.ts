import { distanceMeters, pathsBounds, type LngLat } from './geo';
import { PICTOGRAM_CATALOGUE, type CataloguePictogram } from './pictograms';

/** Pictograms a place can wear: the catalogue (spec 011), plus « here » for the start. */
/** A saved place's pictogram, « here », or « here » while the position is unknown (spec 017). */
export type PlaceIcon = CataloguePictogram | 'person_pin_circle' | 'person_off';

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
  /**
   * French street address, only read by a passer-by on the help card (spec 029): from the
   * address search, or asked to Photon once when the place is made. Never kept for a place
   * hidden from the map (home, family): it would read too easily on a seized phone.
   */
  address?: string;
  /** Where the place is; a place without one has no pin on the map (spec 005). */
  point?: LngLat;
  /**
   * Kept off the home map, so that someone who sees the phone cannot spot it (spec 005).
   * Set by whoever creates the place; still offered in the place sheet.
   */
  hiddenOnMap?: boolean;
  /** When the place was added on this phone (ms since 1970): newest first after home. */
  createdAt?: number;
};

/** The traveller's current position, offered as a starting point. */
export const CURRENT_POSITION: Place = {
  id: 'here',
  icon: 'person_pin_circle',
  helpName: 'ma position',
};

/** Pictograms offered when a place is created (E28), in the order of the catalogue. */
export const PICTOGRAM_CHOICES: readonly PlaceIcon[] = PICTOGRAM_CATALOGUE.flatMap(
  ({ pictograms }) => pictograms.map(({ icon }) => icon),
);

/**
 * Places kept off the home map unless said otherwise (spec 011): every kind of home, and
 * health places a passer-by should not read over the traveller's shoulder.
 */
const PRIVATE_PICTOGRAMS: readonly PlaceIcon[] = [
  'home',
  'family_home',
  'group',
  'night_shelter',
  'hotel',
  'apartment',
  'gynecology',
  'psychology',
  'pregnant_woman',
];

/** Private places stay off the home map unless the person creating them says otherwise. */
export function hiddenOnMapByDefault(icon: PlaceIcon): boolean {
  return PRIVATE_PICTOGRAMS.includes(icon);
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

/**
 * Order of the place sheet and the home carousel (spec 001): the current position, then
 * home, then from the most recent place to the oldest. `created` are the places added on
 * this phone, oldest first; they are newer than every `saved` one.
 */
export function placeOrder(saved: readonly Place[], created: readonly Place[]): Place[] {
  const all = [...[...created].reverse(), ...saved];
  const rank = (place: Place) =>
    place.id === CURRENT_POSITION.id ? 0 : place.icon === 'home' ? 1 : 2;
  // Array.prototype.sort is stable: equal ranks keep their recency order.
  return all.sort((a, b) => rank(a) - rank(b));
}
