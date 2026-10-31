import type { Place, PlaceIcon } from '@/domain/place';
import type { TravelMode } from '@/domain/trip';

/** Which end of the trip a place is being chosen or created for. */
export type TripEnd = 'origin' | 'destination';

/** A place being created (E27-E30): by position (traveller) or address (companion). */
export type PlaceDraft = {
  for: TripEnd;
  source: 'position' | 'address';
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
  | { type: 'chooseMode'; mode: TravelMode }
  | { type: 'goToStep'; index: number }
  | { type: 'startPlace'; for: TripEnd; source: PlaceDraft['source'] }
  | { type: 'setDraftIcon'; icon: PlaceIcon }
  | { type: 'setDraftName'; helpName: string }
  | { type: 'finishPlace'; photo?: string }
  | { type: 'cancelPlace' }
  | { type: 'reset' };

export const initialTripPlan: TripPlanState = { mode: 'transit', customPlaces: [] };

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
    case 'chooseMode':
      return { ...state, mode: action.mode };
    case 'goToStep':
      return { ...state, guidanceStep: action.index };
    case 'startPlace':
      return { ...state, draft: { for: action.for, source: action.source } };
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

  const place: Place = {
    id: `custom-${state.customPlaces.length + 1}`,
    icon: draft.icon ?? 'location_on',
    photo,
    helpName: draft.helpName,
  };
  const withPlace = { ...state, customPlaces: [...state.customPlaces, place], draft: undefined };
  return tripPlanReducer(withPlace, {
    type: draft.for === 'origin' ? 'chooseOrigin' : 'chooseDestination',
    placeId: place.id,
  });
}
