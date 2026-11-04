import { SHARE_LINK_BASE } from '@/domain/share-link';

// Every host the app or its links involve (securite.md §2): one list, read by the reviews.

/** Map tiles (D16, spec 017): receives the IP address and the areas shown. */
export const MAP_TILES_HOST = 'tiles.openfreemap.org';

/**
 * Address search, companion area only (spec 019): receives the typed text, the phone's
 * position rounded to about 1 km, and the IP address.
 */
export const ADDRESS_SEARCH_HOST = 'photon.komoot.io';

/**
 * Share links (spec 019): never called by the app. The page receives a visit only when the
 * app is not installed, never the place, which stays after `#`.
 */
export const SHARE_LINK_HOST = new URL(SHARE_LINK_BASE).host;
