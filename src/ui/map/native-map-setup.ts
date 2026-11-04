import {
  LogManager,
  OfflineManager,
  TransformRequestManager,
} from '@maplibre/maplibre-react-native';

import { MAP_TILES_HOST } from '@/services/map-tiles';

// Locks MapLibre Native down before its first map (security reviews of 2026-11-03 and of
// spec 017):
// - only the tiles host can be reached: any other address, even one slipped into the
//   remote TileJSON, is rewritten to an unreachable one before it leaves the phone;
// - its requests carry a plain user agent, never the app's package name, which would tell
//   the host that this phone runs the refugees' GPS app;
// - the tiles kept from the last use are wiped at start (D16): a searched phone shows no
//   dated history of the areas looked at;
// - its logs never reach the JS console: they carry tile numbers, that is the area the
//   traveller looks at. Native error lines still go to logcat (securite.md §5).

const HOST = MAP_TILES_HOST.replace(/\./g, '\\.');
/** Where any other address goes: nowhere. */
export const BLOCKED_URL = 'https://127.0.0.1:1/blocked';

let secured = false;

export function secureNativeMap() {
  if (secured) return;
  secured = true;
  LogManager.setLogLevel('error');
  LogManager.onLog(() => true);
  TransformRequestManager.addUrlTransform({
    id: 'only-tiles-host',
    match: `^(?!https://${HOST}/)`,
    find: '^.*$',
    replace: BLOCKED_URL,
  });
  TransformRequestManager.addHeader({
    id: 'plain-user-agent',
    name: 'User-Agent',
    value: 'MapLibre Native',
  });
  OfflineManager.clearAmbientCache().catch(() => undefined);
}
