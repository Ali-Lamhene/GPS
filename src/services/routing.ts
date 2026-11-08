import type { LngLat } from '@/domain/geo';
import { readRoute } from '@/domain/route';
import type { Leg, TravelMode } from '@/domain/trip';

import { ROUTING_HOST } from './hosts';

// Spec 021 (D4, D17): a new trip is computed online from the traveller's phone, by
// Transitous. It receives the two points (about 10 m), the time and the IP address. Its terms
// ask for the app's name, its version and a contact (e-mail or website) in the User-Agent:
// the commercial name only, and a mailbox that says nothing of what the app is for (D19).

const USER_AGENT = 'YallaMap/1.0 (otakumi.factory@gmail.com)';
/** Walking or driving longer than two hours is no trip for this app. */
const MAX_DIRECT_SECONDS = 7200;
/** No answer after this: treated as no network, never an endless wait. */
const TIMEOUT_MS = 15000;
/** Larger answers are not read: a trip weighs far less. */
const MAX_ANSWER_CHARS = 1_000_000;

/**
 * offline: no network or no answer in time; service: the service answered with an error;
 * none: no trip by this mode.
 */
export type RouteAnswer =
  { ok: true; legs: Leg[] } | { ok: false; reason: 'offline' | 'service' | 'none' };

/** About 10 m: enough to compute the trip, less precise than the doorstep. */
const place = ([lng, lat]: LngLat) => `${lat.toFixed(4)},${lng.toFixed(4)}`;

/** The trip from `from` to `to` by this mode, leaving now. */
export async function findRoute(
  from: LngLat,
  to: LngLat,
  mode: TravelMode,
  signal: AbortSignal,
): Promise<RouteAnswer> {
  const params = new URLSearchParams({
    fromPlace: place(from),
    toPlace: place(to),
    language: 'fr',
  });
  if (mode !== 'transit') {
    params.set('directModes', 'WALK');
    params.set('transitModes', '');
    params.set('maxDirectTime', String(MAX_DIRECT_SECONDS));
  }
  const controller = new AbortController();
  const stop = () => controller.abort();
  signal.addEventListener('abort', stop);
  const timer = setTimeout(stop, TIMEOUT_MS);
  try {
    const response = await fetch(`https://${ROUTING_HOST}/api/v6/plan?${params.toString()}`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    if (!response.ok) return { ok: false, reason: 'service' };
    const text = await response.text();
    if (text.length > MAX_ANSWER_CHARS) return { ok: false, reason: 'service' };
    const data: unknown = JSON.parse(text);
    const legs = readRoute(data, mode === 'transit' ? 'transit' : 'direct', from, to);
    return legs ? { ok: true, legs } : { ok: false, reason: 'none' };
  } catch {
    return { ok: false, reason: 'offline' };
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', stop);
  }
}
