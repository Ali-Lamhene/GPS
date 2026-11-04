import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { buildGuidance } from '@/domain/guidance-plan';
import type { GuidanceStep } from '@/domain/guidance';
import { CURRENT_POSITION } from '@/domain/place';
import type { Leg, TravelMode } from '@/domain/trip';
import { findRoute } from '@/services/routing';

import { DEMO_GUIDANCE } from '../demo/guidance';
import { DEMO_LEGS } from '../demo/trips';
import { useTripPlan } from './trip-plan-context';

/** A mode's trip, as far as the routing service has answered (spec 021). */
export type RouteState =
  | { kind: 'loading' }
  | { kind: 'ready'; legs: readonly Leg[] }
  | { kind: 'none' }
  | { kind: 'offline' };

type Routes = Record<TravelMode, RouteState>;

const MODES: readonly TravelMode[] = ['walk', 'transit', 'car'];
const LOADING: Routes = {
  walk: { kind: 'loading' },
  transit: { kind: 'loading' },
  car: { kind: 'loading' },
};

type RoutesValue = {
  routes: Routes;
  /** The legs of the chosen mode, empty until known. */
  legs: readonly Leg[];
  /** The guidance steps of the chosen mode's trip. */
  steps: readonly GuidanceStep[];
  /**
   * Asks for the trips of the chosen ends: only once the traveller goes on from the home,
   * never for every end tried there (spec 021). Asking again retries (back from E25).
   */
  request: () => void;
};

const RoutesContext = createContext<RoutesValue | null>(null);

/**
 * Computes the trip by each mode once both ends are chosen (D4, spec 021), from the phone.
 * The start « here » is the position when it was chosen: the trip does not change while the
 * traveller walks. Demonstration (tests, development): the Marseille demo trip.
 */
export function RoutesProvider({
  children,
  demo = false,
}: {
  children: ReactNode;
  demo?: boolean;
}) {
  const { origin, destination, mode, hereAtStart } = useTripPlan();
  const start = origin?.id === CURRENT_POSITION.id ? hereAtStart : origin?.point;
  const end = destination?.point;
  const ends =
    start && end
      ? `${origin?.id ?? ''}>${destination?.id ?? ''}|${start.join(',')}|${end.join(',')}`
      : '';
  const [answer, setAnswer] = useState<{ key: string; routes: Routes } | null>(null);
  const [asked, setAsked] = useState<{ ends: string; attempt: number } | null>(null);
  const key = ends && asked?.ends === ends ? `${ends}#${asked.attempt}` : '';
  const request = () =>
    setAsked((before) => ({
      ends,
      attempt: before?.ends === ends ? before.attempt + 1 : 0,
    }));

  useEffect(() => {
    if (demo || !start || !end || !key) return;
    const controller = new AbortController();
    Promise.all(MODES.map((each) => findRoute(start, end, each, controller.signal))).then(
      (answers) => {
        if (controller.signal.aborted) return;
        const routes = Object.fromEntries(
          MODES.map((each, index) => {
            const result = answers[index];
            const state: RouteState = !result
              ? { kind: 'none' }
              : result.ok
                ? { kind: 'ready', legs: result.legs }
                : // A service error offers no trip: the help, never « no network ».
                  { kind: result.reason === 'offline' ? 'offline' : 'none' };
            return [each, state];
          }),
        ) as Routes;
        setAnswer({ key, routes });
      },
    );
    return () => controller.abort();
    // `start` and `end` are in `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, key]);

  const routes: Routes = demo
    ? {
        walk: { kind: 'ready', legs: DEMO_LEGS.walk },
        transit: { kind: 'ready', legs: DEMO_LEGS.transit },
        car: { kind: 'ready', legs: DEMO_LEGS.car },
      }
    : key && answer?.key === key
      ? answer.routes
      : LOADING;
  const chosen = routes[mode];
  const legs = chosen.kind === 'ready' ? chosen.legs : [];
  const steps = demo ? DEMO_GUIDANCE[mode] : buildGuidance(legs, destination?.helpName);

  return (
    <RoutesContext.Provider value={{ routes, legs, steps, request }}>
      {children}
    </RoutesContext.Provider>
  );
}

export function useRoutes(): RoutesValue {
  const value = useContext(RoutesContext);
  if (!value) throw new Error('useRoutes must be used inside <RoutesProvider>');
  return value;
}
