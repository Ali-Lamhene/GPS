import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import type { LngLat } from '@/domain/geo';
import { introAtStart, introOnRetry, type IntroMode } from '@/domain/permission-intro';
import {
  currentLocationAccess,
  locationServicesOn,
  openLocationSettings,
  openLocationSwitch,
  requestLocationAccess,
  watchLocation,
  type LocationAccess,
} from '@/services/location';

/**
 * Where the traveller is, as far as the app knows (spec 017):
 * - searching: allowed, no point yet;
 * - located: a fresh point;
 * - unavailable: refused, approximate only, or the phone's location switched off.
 */
export type TravellerPosition =
  { kind: 'searching' } | { kind: 'located'; point: LngLat } | { kind: 'unavailable' };

type LocationValue = {
  position: TravellerPosition;
  /** A touch on « here » crossed out: the screen before the permission window, or the switch. */
  retry: () => void;
  /** Spec 038: the screen that explains the permission is up, and for which way out. */
  intro: IntroMode | undefined;
  /** ✓ goes on (the system window, or the settings); ✗ leaves « here » crossed out. */
  answerIntro: (accept: boolean) => void;
  /** The permission is still being read at the start: nothing to show yet, neither home nor screen. */
  checking: boolean;
};

const LocationContext = createContext<LocationValue | null>(null);

/**
 * Asks for the position at the first start, then follows it while the app is in front;
 * stops in the background (spec 017).
 */
export function LocationProvider({
  children,
  fixed,
  onRetry = () => undefined,
}: {
  children: ReactNode;
  /** A position that never changes, without asking the phone: tests and the screen gallery. */
  fixed?: TravellerPosition;
  /** With `fixed`: what a touch on « here » crossed out does. */
  onRetry?: () => void;
}) {
  if (fixed) {
    return (
      <LocationContext.Provider
        value={{
          position: fixed,
          retry: onRetry,
          intro: undefined,
          answerIntro: () => undefined,
          checking: false,
        }}
      >
        {children}
      </LocationContext.Provider>
    );
  }
  return <PhoneLocationProvider>{children}</PhoneLocationProvider>;
}

function PhoneLocationProvider({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<LocationAccess | 'unknown'>('unknown');
  const [servicesOn, setServicesOn] = useState(true);
  const [point, setPoint] = useState<LngLat | undefined>(undefined);
  const [intro, setIntro] = useState<IntroMode | undefined>(undefined);
  // An unknown state at a cold start counts as in front: only the background stops it.
  const [active, setActive] = useState(AppState.currentState !== 'background');

  // First start: the screen that explains the permission shows first, then its window opens,
  // usually with the companion there (spec 038). Already given: nothing is asked.
  useEffect(() => {
    let current = true;
    currentLocationAccess().then((result) => {
      if (!current) return;
      setAccess(result);
      setIntro(introAtStart(result));
    });
    return () => {
      current = false;
    };
  }, []);

  // Back from the settings or the background: the permission or the switch may have
  // changed, and the last point is stale (the traveller may have travelled meanwhile).
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      const front = state !== 'background';
      setActive(front);
      if (!front) {
        setPoint(undefined);
        return;
      }
      currentLocationAccess().then((result) => {
        setAccess(result);
        // Given meanwhile (the settings): the explanation has no more to say. Blocked meanwhile:
        // its way out is the settings now, not the system window Android no longer opens.
        setIntro((shown) => (shown ? introOnRetry(result) : shown));
      });
      locationServicesOn().then(setServicesOn);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (access !== 'granted' || !active) return;
    let current = true;
    locationServicesOn().then((on) => {
      if (current) setServicesOn(on);
    });
    const stop = watchLocation(setPoint);
    return () => {
      current = false;
      stop();
    };
  }, [access, active, servicesOn]);

  const usable = access === 'granted' && servicesOn;
  const position: TravellerPosition =
    access === 'unknown'
      ? { kind: 'searching' }
      : !usable
        ? { kind: 'unavailable' }
        : point
          ? { kind: 'located', point }
          : { kind: 'searching' };

  const retry = () => {
    if (access === 'granted' && !servicesOn) {
      openLocationSwitch();
      return;
    }
    // Refused, approximate or blocked: the explanation again, for the right way out (spec 038).
    if (access !== 'unknown') setIntro(introOnRetry(access));
  };

  const answerIntro = (accept: boolean) => {
    const mode = intro;
    setIntro(undefined);
    if (!accept || !mode) return;
    if (mode === 'settings') openLocationSettings();
    // Android asks again, for the precise position.
    else requestLocationAccess().then(setAccess);
  };

  return (
    <LocationContext.Provider
      value={{ position, retry, intro, answerIntro, checking: access === 'unknown' }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useTravellerPosition(): LocationValue {
  const value = useContext(LocationContext);
  if (!value) throw new Error('useTravellerPosition must be used inside <LocationProvider>');
  return value;
}

/** The traveller's point, when known. */
export function positionPoint(position: TravellerPosition): LngLat | undefined {
  return position.kind === 'located' ? position.point : undefined;
}
