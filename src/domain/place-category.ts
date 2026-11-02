import type { PlaceIcon } from './place';

/**
 * Family of a place, from its pictogram. Each family has its own colour on the home tiles
 * (spec 007): one more channel, besides the pictogram, to tell places apart.
 */
export type PlaceCategory =
  'home' | 'family' | 'health' | 'admin' | 'studies' | 'work' | 'shopping' | 'leisure' | 'other';

const CATEGORIES: Record<PlaceIcon, PlaceCategory> = {
  home: 'home',
  family_restroom: 'family',
  local_hospital: 'health',
  local_pharmacy: 'health',
  location_city: 'admin',
  school: 'studies',
  local_library: 'studies',
  work: 'work',
  shopping_bag: 'shopping',
  shopping_cart: 'shopping',
  restaurant: 'shopping',
  beach_access: 'leisure',
  fitness_center: 'leisure',
  park: 'leisure',
  sports_soccer: 'leisure',
  favorite: 'other',
  my_location: 'other',
  location_on: 'other',
};

export function placeCategory(icon: PlaceIcon): PlaceCategory {
  return CATEGORIES[icon];
}

function isPlaceIcon(icon: string): icon is PlaceIcon {
  return Object.prototype.hasOwnProperty.call(CATEGORIES, icon);
}

/** Family of any pictogram: one that is not a place's (a flag, a vehicle) is « other ». */
export function categoryOfIcon(icon: string): PlaceCategory {
  return isPlaceIcon(icon) ? CATEGORIES[icon] : 'other';
}
