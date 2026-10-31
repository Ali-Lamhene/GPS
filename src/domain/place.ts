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
