import { useEffect, useReducer, useRef } from 'react';

import type { LngLat } from '@/domain/geo';
import {
  backOnRoute,
  farFromAlert,
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

type State = {
  track: OffRouteTrack;
  /** Where the alert came, while lost (spec 032): the new trip waits 30 m from there. */
  alertAt?: LngLat;
  back: number;
  computing: boolean;
};
type Action =
  | { type: 'point'; point: LngLat; off: boolean; near: boolean }
  | { type: 'reset' }
  | { type: 'computing' }
  | { type: 'rerouted' }
  | { type: 'failed' };

const INITIAL: State = { track: ON_ROUTE, back: 0, computing: false };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'point': {
      if (state.alertAt) {
        // Back on the way only close to it, on two points in a row.
        const back = action.near ? state.back + 1 : 0;
        return backOnRoute(back) ? INITIAL : { ...state, back };
      }
      const track = trackOffRoute(state.track, action.off);
      return { ...state, track, alertAt: isLost(track) ? action.point : undefined };
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
 * Specs 031 and 032: follows each new point on a walk; off the way on two points, the
 * traveller is lost: the alert cue at once (again every 30 s); once 30 m on from where the
 * alert came, a new trip from where they stand (`reroute`). No recent point, or a step that
 * is not a walk: nothing to follow.
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
  reroute: (from: LngLat, signal: AbortSignal, onStart?: () => void) => Promise<boolean>;
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
      point,
      off: isOffRoute(legs, legIndex, point),
      near: isBackOnRoute(legs, legIndex, point),
    });
    // Only a new point, or the end of the walk, moves this on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point, walking]);

  const { alertAt, computing } = state;
  const lost = alertAt !== undefined;
  // Still near where the alert came: the traveller may turn back; no new trip yet.
  const goneOn = alertAt !== undefined && point !== undefined && farFromAlert(alertAt, point);
  useEffect(() => {
    if (!lost) return;
    playCue('alert');
    const timer = setInterval(() => playCue('alert'), ALERT_AGAIN_MS);
    return () => clearInterval(timer);
  }, [lost]);

  // The request under way: a new point never cuts it (the traveller walks on while it
  // runs); only the way found again, the end of the walk or the screen gone do.
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    if (goneOn) return;
    request.current?.abort();
    request.current = null;
  }, [goneOn]);
  useEffect(() => () => request.current?.abort(), []);

  useEffect(() => {
    if (!goneOn || !point || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    void reroute(point, controller.signal, () => dispatch({ type: 'computing' })).then((ok) => {
      if (controller.signal.aborted) return;
      request.current = null;
      if (!ok) {
        dispatch({ type: 'failed' });
        return;
      }
      dispatch({ type: 'rerouted' });
      onRerouted();
    });
    // A new point far enough, with no request under way, tries again; the provider keeps the
    // pace (30 s, six per trip).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goneOn, point]);

  return { lost, computing };
}
