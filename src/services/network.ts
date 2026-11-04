import { useNetworkState } from 'expo-network';

/**
 * True while the phone has no network (spec 017): the map tiles cannot load, the home shows
 * a crossed-out cloud. Unknown counts as online, so the signal never shows by mistake.
 */
export function useIsOffline(): boolean {
  const state = useNetworkState();
  return state.isConnected === false || state.isInternetReachable === false;
}
