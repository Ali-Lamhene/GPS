import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { LngLat } from '@/domain/geo';

import { buildGuidance } from '@/domain/guidance-plan';
import type { GuidanceStep } from '@/domain/guidance';
import { CURRENT_POSITION, isHiddenOnMap, isLocalPicture } from '@/domain/place';
import type { StreetPhoto } from '@/domain/street-photo';
import type { Leg, TravelMode } from '@/domain/trip';
import { findRoute } from '@/services/routing';
import { findStreetPhoto } from '@/services/street-photo';

import { useTripPlan } from './trip-plan-context';

/** A mode's trip, as far as the routing service has answered (spec 021). */
export type RouteState =
  | { kind: 'loading' }
  | { kind: 'ready'; legs: readonly Leg[] }
  | { kind: 'none' }
  | { kind: 'offline' };

type Routes = Record<TravelMode, RouteState>;

const MODES: readonly TravelMode[] = ['walk', 'transit'];
/** New trips when lost (spec 031): at most one every this long, and this many per trip. */
const REROUTE_EVERY_MS = 30_000;
const MAX_REROUTES = 6;

const LOADING: Routes = {
  walk: { kind: 'loading' },
  transit: { kind: 'loading' },
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
  /**
   * A street photo of the arrival (spec 030), asked with the trips when the place has no
   * photo of its own and is not hidden from the map.
   */
  streetPhoto?: StreetPhoto;
  /**
   * The traveller is lost (spec 031): a new trip by the same mode from where they stand to
   * the same arrival, the shortest the service finds. True once the guidance follows it.
   */
  reroute: (from: LngLat, signal: AbortSignal, onStart?: () => void) => Promise<boolean>;
};

const RoutesContext = createContext<RoutesValue | null>(null);

/** Fixed trips for tests: the legs and the guidance steps of each mode. */
export type RoutesFixture = {
  legs: Record<TravelMode, readonly Leg[]>;
  steps: Record<TravelMode, readonly GuidanceStep[]>;
  streetPhoto?: StreetPhoto;
  /** Tests only: what the routing service answers when the traveller is lost. */
  reroute?: typeof findRoute;
};

/**
 * Computes the trip by each mode once both ends are chosen (D4, spec 021), from the phone.
 * The start « here » is the position when it was chosen: the trip does not change while the
 * traveller walks. Tests pass a fixture instead: the app never shows a demonstration trip.
 */
export function RoutesProvider({
  children,
  fixture,
}: {
  children: ReactNode;
  /** Tests only: fixed trips, the routing service is never asked. */
  fixture?: RoutesFixture;
}) {
  const { origin, destination, mode, hereAtStart } = useTripPlan();
  const start = origin?.id === CURRENT_POSITION.id ? hereAtStart : origin?.point;
  const end = destination?.point;
  const ends =
    start && end
      ? `${origin?.id ?? ''}>${destination?.id ?? ''}|${start.join(',')}|${end.join(',')}`
      : '';
  const [answer, setAnswer] = useState<{ key: string; routes: Routes } | null>(null);
  const [photo, setPhoto] = useState<{ ends: string; photo: StreetPhoto } | null>(null);
  // A trip computed again on the way (spec 031), for these ends and this mode only.
  const [rerouted, setRerouted] = useState<{ key: string; legs: readonly Leg[] } | null>(null);
  const [asked, setAsked] = useState<{ ends: string; attempt: number } | null>(null);
  const key = ends && asked?.ends === ends ? `${ends}#${asked.attempt}` : '';
  const request = () =>
    setAsked((before) => ({
      ends,
      attempt: before?.ends === ends ? before.attempt + 1 : 0,
    }));

  useEffect(() => {
    if (fixture || !start || !end || !key) return;
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
  }, [fixture, key]);

  // Once per pair of ends, with the first trip request: never for every end tried on the
  // home, never for a home or a place the traveller photographed (spec 030).
  const wantsPhoto =
    !!destination &&
    !isHiddenOnMap(destination) &&
    !(destination.photo && isLocalPicture(destination.photo));
  useEffect(() => {
    if (fixture || !end || !key || !wantsPhoto || photo?.ends === ends) return;
    const controller = new AbortController();
    findStreetPhoto(end, controller.signal).then((found) => {
      if (!controller.signal.aborted && found) setPhoto({ ends, photo: found });
    });
    return () => controller.abort();
    // `end` is in `ends`, itself in `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixture, key, wantsPhoto]);

  const routes: Routes = fixture
    ? {
        walk: { kind: 'ready', legs: fixture.legs.walk },
        transit: { kind: 'ready', legs: fixture.legs.transit },
      }
    : key && answer?.key === key
      ? answer.routes
      : LOADING;
  const chosen = routes[mode];
  const rerouteKey = `${key}|${mode}`;
  const current = rerouted?.key === rerouteKey ? rerouted.legs : undefined;
  const legs = current ?? (chosen.kind === 'ready' ? chosen.legs : []);
  const steps =
    fixture && !current ? fixture.steps[mode] : buildGuidance(legs, destination?.helpName);

  // The limit lives here, per trip and mode, whoever asks and however often the guidance
  // screen comes back: at most one new trip every 30 s, six per trip (spec 031).
  const tries = useRef(new Map<string, { count: number; last: number }>());
  const rerouteWith = fixture?.reroute ?? findRoute;
  const reroute = useCallback(
    async (from: LngLat, signal: AbortSignal, onStart?: () => void): Promise<boolean> => {
      if (!end) return false;
      const now = Date.now();
      const before = tries.current.get(rerouteKey) ?? { count: 0, last: -Infinity };
      if (before.count >= MAX_REROUTES || now - before.last < REROUTE_EVERY_MS) return false;
      tries.current.set(rerouteKey, { count: before.count + 1, last: now });
      // Only a request that really leaves shows the turning arrows (spec 031).
      onStart?.();
      const result = await rerouteWith(from, end, mode, signal);
      if (!result.ok || signal.aborted) return false;
      setRerouted({ key: rerouteKey, legs: result.legs });
      return true;
    },
    [end, mode, rerouteKey, rerouteWith],
  );

  return (
    <RoutesContext.Provider
      value={{
        routes,
        legs,
        steps,
        request,
        reroute,
        // Checked again here: a place hidden since the photo came never shows it.
        streetPhoto: !wantsPhoto
          ? undefined
          : fixture
            ? fixture.streetPhoto
            : photo?.ends === ends
              ? photo.photo
              : undefined,
      }}
    >
      {children}
    </RoutesContext.Provider>
  );
}

export function useRoutes(): RoutesValue {
  const value = useContext(RoutesContext);
  if (!value) throw new Error('useRoutes must be used inside <RoutesProvider>');
  return value;
}
