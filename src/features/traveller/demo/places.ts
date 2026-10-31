import { CURRENT_POSITION, type Place } from '@/domain/place';

// Fake places of the static mockup implementation (D11). Real places come with spec 001.

export const DEMO_PLACES: readonly Place[] = [
  CURRENT_POSITION,
  { id: 'home', icon: 'home', helpName: 'mon domicile' },
  { id: 'work', icon: 'work', helpName: 'mon lieu de travail' },
  { id: 'city', icon: 'location_city', helpName: 'le centre-ville' },
  { id: 'beach', icon: 'beach_access', helpName: 'la plage du Prado' },
  { id: 'gym', icon: 'fitness_center', helpName: 'la salle de sport' },
  { id: 'shop', icon: 'shopping_bag', helpName: 'le marché' },
  { id: 'school', icon: 'school', helpName: "l'école" },
];

export const DEMO_ORIGIN_IDS = ['here', 'home', 'work', 'city', 'beach', 'shop', 'school'];
export const DEMO_DESTINATION_IDS = ['home', 'city', 'beach', 'gym', 'shop', 'school'];
