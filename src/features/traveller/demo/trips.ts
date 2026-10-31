import type { Leg, TransitLeg, TransitLine, TravelMode } from '@/domain/trip';

// Fake network and trip of the static mockup implementation (D11). Real trips come
// with spec 002. Names and lines are fictitious (docs/screens.md, section 1).

const C3: TransitLine = { id: 'C3', color: '#1F5FBF', shape: 'square' };
const M1: TransitLine = { id: 'M1', color: '#6B3FA0', shape: 'pill' };

export const DEMO_BUS_LEG: TransitLeg = {
  kind: 'bus',
  minutes: 12,
  line: C3,
  from: 'Jardin des Plantes',
  to: 'Saint-Charles',
  direction: 'Place du Marché',
  photo: 'busStop',
};

export const DEMO_METRO_LEG: TransitLeg = {
  kind: 'metro',
  minutes: 9,
  line: M1,
  from: 'Hôtel de Ville',
  to: 'Gare Centrale',
  direction: 'Bellevue',
  photo: 'metroPlatform',
};

export const DEMO_LEGS: Record<TravelMode, readonly Leg[]> = {
  walk: [{ kind: 'walk', minutes: 52 }],
  transit: [
    { kind: 'walk', minutes: 6 },
    DEMO_BUS_LEG,
    { kind: 'walk', minutes: 4 },
    DEMO_METRO_LEG,
    { kind: 'walk', minutes: 4 },
  ],
  car: [
    { kind: 'car', minutes: 16 },
    { kind: 'walk', minutes: 2 },
  ],
};
