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
  /** Companion only (spec 019): the place is sent by link, never kept on this phone. */
  send?: boolean;
};

export type TripPlanState = {
  originId?: string;
  destinationId?: string;
  mode: TravelMode;
  customPlaces: Place[];
  draft?: PlaceDraft;
  /** Index of the guidance step the traveller is on, once the trip has started. */
  guidanceStep?: number;
  /** The last new place could not be saved: the home shows the error signal (spec 015). */
  saveFailed?: boolean;
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
  | { type: 'setDraftAddress'; helpName: string; point: LngLat; send: boolean }
  /** `keepDraft`: a place received by link while a new place is being made (spec 019). */
  | { type: 'addPlace'; place: Place; keepDraft?: boolean }
  | { type: 'placeSaveFailed' }
  | { type: 'clearSaveFailed' }
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
    case 'setDraftAddress':
      return state.draft
        ? {
            ...state,
            draft: {
              ...state.draft,
              helpName: action.helpName,
              point: action.point,
              send: action.send,
            },
          }
        : state;
    case 'addPlace':
      return {
        ...state,
        customPlaces: [...state.customPlaces, action.place],
        draft: action.keepDraft ? state.draft : undefined,
      };
    case 'placeSaveFailed':
      return { ...state, draft: undefined, saveFailed: true };
    case 'clearSaveFailed':
      return { ...state, saveFailed: undefined };
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

/** The place a finished draft becomes, once saved; `id` and `createdAt` come from the caller. */
export function placeFromDraft(
  draft: PlaceDraft,
  { id, createdAt, photo }: { id: string; createdAt: number; photo?: string },
): Place {
  const icon = draft.icon ?? 'push_pin';
  return {
    id,
    icon,
    photo,
    helpName: draft.helpName,
    point: draft.point,
    hiddenOnMap: hiddenOnMapByDefault(icon),
    createdAt,
  };
}
