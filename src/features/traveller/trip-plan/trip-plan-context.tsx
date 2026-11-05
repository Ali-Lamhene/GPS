import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';

import { CURRENT_POSITION, placeOrder, type Place } from '@/domain/place';

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

/** Fixed places for tests, with the ones offered as a start and as an arrival. */
export type PlacesFixture = {
  places: readonly Place[];
  originIds: readonly string[];
  destinationIds: readonly string[];
};

/**
 * The trip the traveller is composing, in memory, and their places, read from the phone at
 * start (spec 015). The app has no demonstration places, even in development: only tests
 * pass a fixture.
 */
export function TripPlanProvider({
  children,
  places: storedPlaces = [],
  fixture,
  initialActions = [],
}: {
  children: ReactNode;
  /** The places saved on the phone, oldest first. */
  places?: readonly Place[];
  /** Tests only: fixed places in place of the start choices. */
  fixture?: PlacesFixture;
  /** Replayed once at start: lets tests open any screen. */
  initialActions?: TripPlanAction[];
}) {
  const [state, dispatch] = useReducer(tripPlanReducer, initialActions, (actions) =>
    actions.reduce(tripPlanReducer, { ...initialTripPlan, customPlaces: [...storedPlaces] }),
  );

  const places = [CURRENT_POSITION, ...(fixture?.places ?? []), ...state.customPlaces];
  const choices = (fixtureIds: readonly string[] | undefined, withHere: boolean) =>
    placeOrder(
      fixture && fixtureIds
        ? fixture.places.filter((place) => fixtureIds.includes(place.id))
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
    originChoices: choices(fixture?.originIds, true),
    destinationChoices: choices(fixture?.destinationIds, false),
  };

  return <TripPlanContext.Provider value={value}>{children}</TripPlanContext.Provider>;
}

export function useTripPlan(): TripPlan {
  const plan = useContext(TripPlanContext);
  if (!plan) throw new Error('useTripPlan must be used inside <TripPlanProvider>');
  return plan;
}
