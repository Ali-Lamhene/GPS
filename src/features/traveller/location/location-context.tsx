import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import type { LngLat } from '@/domain/geo';
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
  /** A touch on « here » crossed out: asks again, or opens the right settings. */
  retry: () => void;
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
      <LocationContext.Provider value={{ position: fixed, retry: onRetry }}>
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
  // An unknown state at a cold start counts as in front: only the background stops it.
  const [active, setActive] = useState(AppState.currentState !== 'background');

  // First start: the permission window opens at once, usually with the companion there.
  useEffect(() => {
    let current = true;
    requestLocationAccess().then((result) => {
      if (current) setAccess(result);
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
      currentLocationAccess().then(setAccess);
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
    if (access === 'blocked') openLocationSettings();
    else if (access === 'granted' && !servicesOn) openLocationSwitch();
    // Refused or approximate: Android asks again, for the precise position.
    else requestLocationAccess().then(setAccess);
  };

  return (
    <LocationContext.Provider value={{ position, retry }}>{children}</LocationContext.Provider>
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
