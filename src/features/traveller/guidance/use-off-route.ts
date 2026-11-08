import { useEffect, useReducer } from 'react';

import type { LngLat } from '@/domain/geo';
import {
  backOnRoute,
  isBackOnRoute,
  isLost,
  isOffRoute,
  ON_ROUTE,
  trackOffRoute,
  type OffRouteTrack,
} from '@/domain/off-route';
import type { Leg } from '@/domain/trip';
import { playCue } from '@/services/feedback';

/** While still lost with no new trip, the alert comes again this often (phone in a pocket). */
const ALERT_AGAIN_MS = 30_000;

type State = { track: OffRouteTrack; lost: boolean; back: number; computing: boolean };
type Action =
  | { type: 'point'; off: boolean; near: boolean; at: number }
  | { type: 'reset' }
  | { type: 'computing' }
  | { type: 'rerouted' }
  | { type: 'failed' };

const INITIAL: State = { track: ON_ROUTE, lost: false, back: 0, computing: false };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'point': {
      if (state.lost) {
        // Back on the way only close to it, on two points in a row.
        const back = action.near ? state.back + 1 : 0;
        return backOnRoute(back) ? INITIAL : { ...state, back };
      }
      const track = trackOffRoute(state.track, action.off, action.at);
      return { ...state, track, lost: isLost(track, action.at) };
    }
    case 'reset':
    case 'rerouted':
      return INITIAL;
    case 'computing':
      return { ...state, computing: true };
    case 'failed':
      return { ...state, computing: false };
    default: {
      const unknown: never = action;
      return unknown;
    }
  }
}

/**
 * Spec 031: follows each new point on a walk; off the way long enough, the traveller is
 * lost: the alert cue (again every 30 s), then a new trip from where they stand (`reroute`),
 * like a mainstream GPS. No recent point, or a step that is not a walk: nothing to follow.
 */
export function useOffRoute({
  point,
  legs,
  legIndex,
  reroute,
  onRerouted,
}: {
  /** The latest point, recent only. */
  point: LngLat | undefined;
  legs: readonly Leg[];
  legIndex: number;
  /** Refuses on its own past its limit (spec 031); cut when no longer needed. */
  reroute: (from: LngLat, signal: AbortSignal) => Promise<boolean>;
  onRerouted: () => void;
}): { lost: boolean; computing: boolean } {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const walking = legs[legIndex]?.kind === 'walk';

  useEffect(() => {
    if (!point || !walking) {
      dispatch({ type: 'reset' });
      return;
    }
    dispatch({
      type: 'point',
      off: isOffRoute(legs, legIndex, point),
      near: isBackOnRoute(legs, legIndex, point),
      at: Date.now(),
    });
    // Only a new point, or the end of the walk, moves this on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point, walking]);

  const { lost, computing } = state;
  useEffect(() => {
    if (!lost) return;
    playCue('alert');
    const timer = setInterval(() => playCue('alert'), ALERT_AGAIN_MS);
    return () => clearInterval(timer);
  }, [lost]);

  useEffect(() => {
    if (!lost || !point) return;
    // Back on the way, or the screen gone: the answer is ignored.
    const controller = new AbortController();
    dispatch({ type: 'computing' });
    void reroute(point, controller.signal).then((ok) => {
      if (controller.signal.aborted) return;
      if (!ok) {
        dispatch({ type: 'failed' });
        return;
      }
      dispatch({ type: 'rerouted' });
      onRerouted();
    });
    return () => controller.abort();
    // A new point while lost tries again; the provider keeps the pace (30 s, six per trip).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lost, point]);

  return { lost, computing };
}
