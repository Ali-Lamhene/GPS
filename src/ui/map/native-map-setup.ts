import { LogManager, NetworkManager } from '@maplibre/maplibre-react-native';

// Locks MapLibre Native down before its first map (security review, 2026-11-03):
// - its HTTP stack is switched off, so even a remote address slipped into a style one day
//   would not leave the phone; the bundled archive is read from a file, not the network;
// - its logs never reach the JS console: they carry tile numbers, that is the area the
//   traveller looks at. Native error lines still go to logcat (securite.md §5).

let secured = false;

export function secureNativeMap() {
  if (secured) return;
  secured = true;
  NetworkManager.setConnected(false);
  LogManager.setLogLevel('error');
  LogManager.onLog(() => true);
}
