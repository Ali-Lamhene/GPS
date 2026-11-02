import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';

import { placeOrder, type Place } from '@/domain/place';

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
  /** Places offered as a start, then as an arrival, in the order of spec 001. */
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
  const choices = (ids: string[]) =>
    placeOrder(
      DEMO_PLACES.filter((place) => ids.includes(place.id)),
      state.customPlaces,
    );

  const value: TripPlan = {
    ...state,
    dispatch,
    origin: places.find((place) => place.id === state.originId),
    destination: places.find((place) => place.id === state.destinationId),
    originChoices: choices(DEMO_ORIGIN_IDS),
    destinationChoices: choices(DEMO_DESTINATION_IDS),
  };

  return <TripPlanContext.Provider value={value}>{children}</TripPlanContext.Provider>;
}

export function useTripPlan(): TripPlan {
  const plan = useContext(TripPlanContext);
  if (!plan) throw new Error('useTripPlan must be used inside <TripPlanProvider>');
  return plan;
}
