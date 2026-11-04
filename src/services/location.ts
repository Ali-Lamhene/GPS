import {
  Accuracy,
  getForegroundPermissionsAsync,
  hasServicesEnabledAsync,
  requestForegroundPermissionsAsync,
  watchPositionAsync,
  type LocationPermissionResponse,
} from 'expo-location';
import { Linking, Platform } from 'react-native';

import type { LngLat } from '@/domain/geo';

// Spec 017: the phone's position, while the app is in front only (never in the background).
// Android's standard (fused) provider, like the usual GPS apps: the phone's « Google
// Location Accuracy » setting decides what goes to Google, not the app. The position stays
// in memory: never saved, never sent by the app.

/**
 * - granted: precise position allowed;
 * - coarse: only an approximate one (Android 12+), off by up to 2 km: « here » unusable;
 * - denied: refused, Android can still ask; blocked: refused for good, settings only.
 */
export type LocationAccess = 'granted' | 'coarse' | 'denied' | 'blocked';

function access(result: LocationPermissionResponse): LocationAccess {
  if (result.granted) return result.android?.accuracy === 'coarse' ? 'coarse' : 'granted';
  return result.canAskAgain ? 'denied' : 'blocked';
}

/** Asks for the precise position while the app is used. */
export async function requestLocationAccess(): Promise<LocationAccess> {
  try {
    return access(await requestForegroundPermissionsAsync());
  } catch {
    return 'denied';
  }
}

/** The current permission, without asking. */
export async function currentLocationAccess(): Promise<LocationAccess> {
  try {
    return access(await getForegroundPermissionsAsync());
  } catch {
    return 'denied';
  }
}

/** Android no longer shows its window: the app settings are the only way left. */
export function openLocationSettings(): void {
  Linking.openSettings().catch(() => undefined);
}

/** Whether the phone's location switch is on. */
export async function locationServicesOn(): Promise<boolean> {
  try {
    return await hasServicesEnabledAsync();
  } catch {
    return false;
  }
}

/**
 * Opens the phone's location switch, on a touch only. Not Google's « turn on » window
 * (`enableNetworkProviderAsync`): it would also switch on Google's Wi-Fi based accuracy,
 * which sends the networks around to Google.
 */
export function openLocationSwitch(): void {
  const opened =
    Platform.OS === 'android'
      ? Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS')
      : Linking.openSettings();
  opened.catch(() => undefined);
}

/**
 * Follows the position; returns the function that stops it. Updates every 5 m at most, a
 * walking pace, so the battery lasts. Never opens Android's « turn location on » window by
 * itself: only a touch on « here » does (turnLocationServicesOn).
 */
export function watchLocation(onPoint: (point: LngLat) => void): () => void {
  let stopped = false;
  let remove: (() => void) | undefined;
  watchPositionAsync(
    { accuracy: Accuracy.High, distanceInterval: 5, mayShowUserSettingsDialog: false },
    (location) => {
      onPoint([location.coords.longitude, location.coords.latitude]);
    },
  ).then(
    (subscription) => {
      if (stopped) subscription.remove();
      else remove = () => subscription.remove();
    },
    // Location switched off: no point; « here » shows crossed out.
    () => undefined,
  );
  return () => {
    stopped = true;
    remove?.();
  };
}
