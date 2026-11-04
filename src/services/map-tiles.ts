// The only host the map calls (spec 017, D16): OpenFreeMap, free, without key or account.
// It receives the phone's IP address and the tiles shown, that is where the traveller is
// and when: an exception to D1, accepted for the first version until the map is bundled
// again. HTTPS only.

/** TileJSON of the OpenStreetMap vector tiles (OpenMapTiles schema). */
export const MAP_TILES_URL = 'https://tiles.openfreemap.org/planet/latest';

/** Host of every tile request, for the checks that nothing else is called. */
export const MAP_TILES_HOST = 'tiles.openfreemap.org';

/** Credit required by the tiles' licences, folded behind ⓘ (D9). */
export const MAP_CREDIT = '© OpenFreeMap © OpenMapTiles © OpenStreetMap';
