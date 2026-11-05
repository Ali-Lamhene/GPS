import type { Leg, TransitLeg, TransitLine, TravelMode } from '@/domain/trip';

import {
  BUS_41,
  CAR,
  CAR_TO_DESTINATION,
  METRO_M1,
  TO_BUS_STOP,
  TO_DESTINATION,
  TO_METRO,
  WALK_ONLY,
} from './marseille-paths';

// Demo trip of the static implementation (D11, spec 002): real streets, stops and lines
// in central Marseille, from near Place de la Corderie to near the Saint-Charles station.
// Line colours are the RTM colours recorded in OpenStreetMap. Durations are estimates.

/** Where the traveller stands before leaving: the start of the demo trip. */
export const DEMO_CURRENT_POSITION = TO_BUS_STOP[0] ?? ([5.3685, 43.2879] as const);

const BUS_41_LINE: TransitLine = {
  id: '41',
  color: '#76C9B6',
  textColor: '#1B1C1A',
  shape: 'square',
};
const M1: TransitLine = { id: 'M1', color: '#0075BE', shape: 'pill' };

export const DEMO_BUS_LEG: TransitLeg = {
  kind: 'bus',
  minutes: 5,
  line: BUS_41_LINE,
  from: 'Place de la Corderie',
  to: 'Vieux Port Ballard',
  via: ['Fort Notre-Dame', 'Place aux Huiles'],
  direction: 'Vieux Port Ballard',
  path: BUS_41,
};

export const DEMO_METRO_LEG: TransitLeg = {
  kind: 'metro',
  minutes: 4,
  line: M1,
  from: 'Vieux-Port',
  to: 'Saint-Charles',
  via: ['Colbert'],
  direction: 'La Rose',
  path: METRO_M1,
};

export const DEMO_LEGS: Record<TravelMode, readonly Leg[]> = {
  walk: [{ kind: 'walk', minutes: 38, path: WALK_ONLY }],
  transit: [
    { kind: 'walk', minutes: 8, path: TO_BUS_STOP },
    DEMO_BUS_LEG,
    { kind: 'walk', minutes: 4, path: TO_METRO },
    DEMO_METRO_LEG,
    { kind: 'walk', minutes: 5, path: TO_DESTINATION },
  ],
  car: [
    { kind: 'car', minutes: 12, path: CAR },
    { kind: 'walk', minutes: 2, path: CAR_TO_DESTINATION },
  ],
};
