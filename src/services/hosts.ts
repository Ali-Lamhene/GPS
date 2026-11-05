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
 * Trip computation (D4, spec 021): Transitous, a free community service (MOTIS). Receives
 * the start and the arrival points, the time, the app's commercial name with a contact
 * mailbox (its terms ask for them, D19), and the IP address.
 */
export const ROUTING_HOST = 'api.transitous.org';

/**
 * Share links (spec 019): never called by the app. The page receives a visit only when the
 * app is not installed, never the place, which stays after `#`. Android itself (Google Play
 * services) fetches `/.well-known/assetlinks.json` at install and update: Google, and the
 * host, learn that this device or IP installed an app tied to this domain.
 */
export const SHARE_LINK_HOST = new URL(SHARE_LINK_BASE).host;

/**
 * Credit pages (spec 024): never called by the app. Opened in the phone's browser only when
 * the companion touches a credit link (E30); the site then gets the phone's IP address, as
 * any visit. Fixed addresses: nothing in them comes from a place or a search.
 */
export const CREDIT_PAGES = {
  /** Transitous asks for a visible link to the sources of its data (D17). */
  routingSources: 'https://transitous.org/sources/',
  /** OpenStreetMap's attribution guidelines, for the map and the address search. */
  openStreetMap: 'https://www.openstreetmap.org/copyright',
} as const;
