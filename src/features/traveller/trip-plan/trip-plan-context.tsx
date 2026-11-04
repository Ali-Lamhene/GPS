import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';

import { CURRENT_POSITION, placeOrder, type Place } from '@/domain/place';

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

/**
 * The trip the traveller is composing, in memory, and their places, read from the phone at
 * start (spec 015). The demonstration places only show when asked for: in tests, and in
 * development with `EXPO_PUBLIC_DEMO_PLACES=1`.
 */
export function TripPlanProvider({
  children,
  places: storedPlaces = [],
  demo = false,
  initialActions = [],
}: {
  children: ReactNode;
  /** The places saved on the phone, oldest first. */
  places?: readonly Place[];
  /** Adds the demonstration places of the static mockup (D11). */
  demo?: boolean;
  /** Replayed once at start: lets tests and the dev screen gallery open any screen. */
  initialActions?: TripPlanAction[];
}) {
  const [state, dispatch] = useReducer(tripPlanReducer, initialActions, (actions) =>
    actions.reduce(tripPlanReducer, { ...initialTripPlan, customPlaces: [...storedPlaces] }),
  );

  const demoPlaces = demo ? DEMO_PLACES : [];
  const places = [CURRENT_POSITION, ...demoPlaces, ...state.customPlaces];
  const choices = (demoIds: string[], withHere: boolean) =>
    placeOrder(
      demo
        ? DEMO_PLACES.filter((place) => demoIds.includes(place.id))
        : withHere
          ? [CURRENT_POSITION]
          : [],
      state.customPlaces,
    );

  const value: TripPlan = {
    ...state,
    dispatch,
    origin: places.find((place) => place.id === state.originId),
    destination: places.find((place) => place.id === state.destinationId),
    originChoices: choices(DEMO_ORIGIN_IDS, true),
    destinationChoices: choices(DEMO_DESTINATION_IDS, false),
  };

  return <TripPlanContext.Provider value={value}>{children}</TripPlanContext.Provider>;
}

export function useTripPlan(): TripPlan {
  const plan = useContext(TripPlanContext);
  if (!plan) throw new Error('useTripPlan must be used inside <TripPlanProvider>');
  return plan;
}
