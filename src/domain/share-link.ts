import { isCataloguePictogram, type CataloguePictogram } from './pictograms';
import { distanceMeters, type LngLat } from './geo';
import type { Place } from './place';

// Spec 001 (C, D): a place travels inside the share link itself. Only the format version,
// the point and the pictogram, after `#`: that part never reaches a server, the link page
// included. No name, no photo, no address. The link is untrusted input (securite.md §3):
// anyone can forge one, so everything else is refused.

const SHARE_LINK_PAGE = 'https://ali-lamhene.github.io/gps/lieu';
/** With its final slash: GitHub Pages answers the page without it by a redirect. */
export const SHARE_LINK_BASE = `${SHARE_LINK_PAGE}/`;
const VERSION = '1';
/** About 1 m: enough for a building entrance, no more. */
const DECIMALS = 5;
const MAX_LENGTH = 200;

export type SharedPlace = { point: LngLat; icon: CataloguePictogram };

export type DecodedLink =
  | { ok: true; place: SharedPlace }
  | { ok: false; reason: 'not-a-place-link' | 'unknown-version' | 'damaged' };

/** The link that carries this place. */
export function encodeShareLink({ point, icon }: SharedPlace): string {
  const [lng, lat] = point;
  return `${SHARE_LINK_BASE}#${VERSION}/${lat.toFixed(DECIMALS)}/${lng.toFixed(DECIMALS)}/${icon}`;
}

/** Whether a URL is a place link at all, before reading what it carries. */
export function isShareLink(url: string): boolean {
  return (
    url === SHARE_LINK_PAGE ||
    url === SHARE_LINK_BASE ||
    url.startsWith(`${SHARE_LINK_PAGE}#`) ||
    url.startsWith(`${SHARE_LINK_BASE}#`)
  );
}

const NUMBER = /^-?\d{1,3}\.\d{1,7}$/;

/** The place a link carries, or why it carries none. */
export function decodeShareLink(url: string): DecodedLink {
  if (url.length > MAX_LENGTH || !isShareLink(url))
    return { ok: false, reason: 'not-a-place-link' };
  const hash = url.slice(url.indexOf('#') + 1);
  const parts = hash.split('/');
  if (parts[0] !== VERSION) return { ok: false, reason: parts[0] ? 'unknown-version' : 'damaged' };
  if (parts.length !== 4) return { ok: false, reason: 'damaged' };
  const [, latText = '', lngText = '', icon = ''] = parts;
  if (!NUMBER.test(latText) || !NUMBER.test(lngText) || !isCataloguePictogram(icon)) {
    return { ok: false, reason: 'damaged' };
  }
  const lat = Number(latText);
  const lng = Number(lngText);
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return { ok: false, reason: 'damaged' };
  return { ok: true, place: { point: [lng, lat], icon } };
}

/** Within this distance and with the same pictogram, a received place is one already kept. */
const SAME_PLACE_METERS = 15;

/** The place already kept that a received one repeats, if any (spec 001: no duplicate). */
export function findSamePlace(places: readonly Place[], shared: SharedPlace): Place | undefined {
  return places.find(
    (place) =>
      place.icon === shared.icon &&
      place.point !== undefined &&
      distanceMeters(place.point, shared.point) <= SAME_PLACE_METERS,
  );
}
