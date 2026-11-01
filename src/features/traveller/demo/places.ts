import { CURRENT_POSITION, type Place } from '@/domain/place';

import { DEMO_PHOTOS } from './photos';

// Fake places of the static mockup implementation (D11). Real places come with spec 001.
// Points are real spots in central Marseille (spec 005); the beach lies outside the bundled
// map and more than 2 km away. Whatever the place chosen, the demo trip stays the same.
// Public places carry a free photo; work, the beach and the market keep their pictogram.

export const DEMO_PLACES: readonly Place[] = [
  CURRENT_POSITION,
  {
    id: 'home',
    icon: 'home',
    helpName: 'mon domicile',
    point: [5.3795, 43.2855],
    hiddenOnMap: true,
  },
  { id: 'work', icon: 'work', helpName: 'mon lieu de travail', point: [5.3868, 43.2992] },
  {
    id: 'city',
    icon: 'location_city',
    helpName: 'la mairie',
    point: [5.3772, 43.2966],
    photo: DEMO_PHOTOS.city,
  },
  {
    id: 'beach',
    icon: 'beach_access',
    helpName: 'la plage du Prado',
    point: [5.372, 43.26],
  },
  {
    id: 'gym',
    icon: 'fitness_center',
    helpName: 'la salle de sport',
    point: [5.3735, 43.2925],
    photo: DEMO_PHOTOS.gym,
  },
  { id: 'shop', icon: 'shopping_bag', helpName: 'le marché', point: [5.3812, 43.2952] },
  {
    id: 'school',
    icon: 'school',
    helpName: "l'école",
    point: [5.3642, 43.2903],
    photo: DEMO_PHOTOS.school,
  },
];

export const DEMO_ORIGIN_IDS = ['here', 'home', 'work', 'city', 'beach', 'shop', 'school'];
export const DEMO_DESTINATION_IDS = ['home', 'city', 'beach', 'gym', 'shop', 'school'];
