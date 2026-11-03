import type { LngLat } from '@/domain/geo';
import { hiddenOnMapByDefault, type Place, type PlaceIcon } from '@/domain/place';
import type { TravelMode } from '@/domain/trip';

/** Which end of the trip a place is being chosen or created for. */
export type TripEnd = 'origin' | 'destination';

/**
 * A place being created from the home « + » (E27-E30, spec 007): by position (traveller)
 * or address (companion). Once saved it is only kept, never chosen for the trip.
 */
export type PlaceDraft = {
  source: 'position' | 'address';
  /** Where the place is, when known: the traveller's position for E27. */
  point?: LngLat;
  icon?: PlaceIcon;
  helpName?: string;
};

export type TripPlanState = {
  originId?: string;
  destinationId?: string;
  mode: TravelMode;
  customPlaces: Place[];
  draft?: PlaceDraft;
  /** Index of the guidance step the traveller is on, once the trip has started. */
  guidanceStep?: number;
};

export type TripPlanAction =
  | { type: 'chooseOrigin'; placeId: string }
  | { type: 'chooseDestination'; placeId: string }
  | { type: 'clearDestination' }
  | { type: 'chooseMode'; mode: TravelMode }
  | { type: 'goToStep'; index: number }
  | { type: 'startPlace'; source: PlaceDraft['source']; point?: LngLat }
  | { type: 'setDraftIcon'; icon: PlaceIcon }
  | { type: 'setDraftName'; helpName: string }
  | { type: 'finishPlace'; photo?: string }
  | { type: 'cancelPlace' }
  | { type: 'reset' };

/**
 * Nothing chosen: the home invites the traveller to choose the start, then the arrival
 * (spec 008, revises spec 005 where the trip started where they stand).
 */
export const initialTripPlan: TripPlanState = {
  mode: 'transit',
  customPlaces: [],
};

export function tripPlanReducer(state: TripPlanState, action: TripPlanAction): TripPlanState {
  switch (action.type) {
    case 'chooseOrigin':
      return {
        ...state,
        originId: action.placeId,
        // A trip cannot start and end at the same place.
        destinationId: state.destinationId === action.placeId ? undefined : state.destinationId,
      };
    case 'chooseDestination':
      if (action.placeId === state.originId) return state;
      return { ...state, destinationId: action.placeId };
    case 'clearDestination':
      return { ...state, destinationId: undefined };
    case 'chooseMode':
      return { ...state, mode: action.mode };
    case 'goToStep':
      return { ...state, guidanceStep: action.index };
    case 'startPlace':
      return {
        ...state,
        draft: { source: action.source, point: action.point },
      };
    case 'setDraftIcon':
      return state.draft ? { ...state, draft: { ...state.draft, icon: action.icon } } : state;
    case 'setDraftName':
      return state.draft
        ? { ...state, draft: { ...state.draft, helpName: action.helpName } }
        : state;
    case 'finishPlace':
      return finishPlace(state, action.photo);
    case 'cancelPlace':
      return { ...state, draft: undefined };
    case 'reset':
      return { ...initialTripPlan, customPlaces: state.customPlaces };
    default: {
      const unknown: never = action;
      return unknown;
    }
  }
}

function finishPlace(state: TripPlanState, photo?: string): TripPlanState {
  const { draft } = state;
  if (!draft) return state;

  const icon = draft.icon ?? 'push_pin';
  const place: Place = {
    id: `custom-${state.customPlaces.length + 1}`,
    icon,
    photo,
    helpName: draft.helpName,
    point: draft.point,
    hiddenOnMap: hiddenOnMapByDefault(icon),
  };
  return { ...state, customPlaces: [...state.customPlaces, place], draft: undefined };
}
