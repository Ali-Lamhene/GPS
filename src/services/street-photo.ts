import type { LngLat } from '@/domain/geo';
import { readStreetPhoto, type StreetPhoto } from '@/domain/street-photo';

import {
  STREET_PHOTO_FINAL_HOSTS,
  STREET_PHOTO_IMAGE_HOSTS,
  STREET_PHOTO_SEARCH_HOST,
} from './hosts';

// Spec 030: a street-level photo of the arrival, from Panoramax (free, open, no key). The
// search receives the arrival point to about 10 m and the IP address; the picture host the
// IP and the picture. The picture is downloaded once, while the trip is computed, and held
// in memory only as a `data:` address: nothing about the arrival on disk, no request near it.

const TIMEOUT_MS = 8000;
const MAX_ANSWER_CHARS = 300_000;
const MAX_PICTURE_BYTES = 1_500_000;
/** No HTTP cache: the search address holds the arrival point (OkHttp, NSURLCache). */
const NO_STORE = { 'Cache-Control': 'no-store' };

async function download(url: string, signal: AbortSignal): Promise<string | undefined> {
  const response = await fetch(url, { signal, headers: NO_STORE });
  if (!response.ok) return undefined;
  const final = new URL(response.url || url);
  const finalHosts: readonly string[] = STREET_PHOTO_FINAL_HOSTS;
  if (final.protocol !== 'https:' || !finalHosts.includes(final.host)) return undefined;
  if (!(response.headers.get('content-type') ?? '').startsWith('image/jpeg')) return undefined;
  const announced = Number(response.headers.get('content-length') ?? 0);
  if (announced > MAX_PICTURE_BYTES) return undefined;
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length === 0 || bytes.length > MAX_PICTURE_BYTES) return undefined;
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return `data:image/jpeg;base64,${btoa(binary)}`;
}

/** A picture taken within 50 m that looks at the arrival, ready to show, or nothing. */
export async function findStreetPhoto(
  place: LngLat,
  signal: AbortSignal,
): Promise<StreetPhoto | undefined> {
  const params = new URLSearchParams({
    place_position: `${place[0].toFixed(4)},${place[1].toFixed(4)}`,
    place_distance: '2-50',
    limit: '10',
  });
  const controller = new AbortController();
  const stop = () => controller.abort();
  signal.addEventListener('abort', stop);
  const timer = setTimeout(stop, TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://${STREET_PHOTO_SEARCH_HOST}/api/search?${params.toString()}`,
      { signal: controller.signal, headers: NO_STORE },
    );
    if (!response.ok) return undefined;
    const text = await response.text();
    if (text.length > MAX_ANSWER_CHARS) return undefined;
    const found = readStreetPhoto(JSON.parse(text), place, STREET_PHOTO_IMAGE_HOSTS);
    if (!found) return undefined;
    const data = await download(found.url, controller.signal);
    return data ? { ...found, url: data } : undefined;
  } catch {
    // No network, too slow, or a damaged answer: the arrival shows without a street photo.
    return undefined;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', stop);
  }
}
