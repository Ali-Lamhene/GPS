import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';

import type { Place } from '@/domain/place';

import { DEMO_DESTINATION_IDS, DEMO_ORIGIN_IDS, DEMO_PLACES } from '../demo/places';
import {
  initialTripPlan,
  tripPlanReducer,
  type TripPlanAction,
  type TripPlanState,
} from './trip-plan-reducer';

type TripPlan = TripPlanState & {
  dispatch: Dispatch<TripPlanAction>;
  origin?: Place;
  destination?: Place;
  /** Places offered as a start, then as an arrival: saved ones first, then new ones. */
  originChoices: Place[];
  destinationChoices: Place[];
};

const TripPlanContext = createContext<TripPlan | null>(null);

/** The trip the traveller is composing, kept in memory only (static mockup, D11). */
export function TripPlanProvider({
  children,
  initialActions = [],
}: {
  children: ReactNode;
  /** Replayed once at start: lets tests and the dev screen gallery open any screen. */
  initialActions?: TripPlanAction[];
}) {
  const [state, dispatch] = useReducer(tripPlanReducer, initialActions, (actions) =>
    actions.reduce(tripPlanReducer, initialTripPlan),
  );

  const places = [...DEMO_PLACES, ...state.customPlaces];
  const byIds = (ids: string[]) => places.filter((place) => ids.includes(place.id));
  const customIds = state.customPlaces.map((place) => place.id);

  const value: TripPlan = {
    ...state,
    dispatch,
    origin: places.find((place) => place.id === state.originId),
    destination: places.find((place) => place.id === state.destinationId),
    originChoices: byIds([...DEMO_ORIGIN_IDS, ...customIds]),
    destinationChoices: byIds([...DEMO_DESTINATION_IDS, ...customIds]),
  };

  return <TripPlanContext.Provider value={value}>{children}</TripPlanContext.Provider>;
}

export function useTripPlan(): TripPlan {
  const plan = useContext(TripPlanContext);
  if (!plan) throw new Error('useTripPlan must be used inside <TripPlanProvider>');
  return plan;
}
