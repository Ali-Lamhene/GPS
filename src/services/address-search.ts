import { readPhotonResults, type AddressResult } from '@/domain/address';

// Spec 001: address search for the companion only (never the traveller's screens), through
// Photon (komoot, OpenStreetMap data). Photon receives the typed text, the phone's position
// rounded to about 1 km (it only ranks the results), and the IP address.
// HTTPS only, no key, no account.

import { ADDRESS_SEARCH_HOST } from './hosts';
const MIN_LENGTH = 3;

export type AddressSearch =
  { ok: true; results: AddressResult[] } | { ok: false; reason: 'offline' };

/** Addresses matching the typed text, in France first, nearest to `near` when given. */
export async function searchAddresses(
  query: string,
  signal: AbortSignal,
  near?: readonly [number, number],
): Promise<AddressSearch> {
  const text = query.trim();
  if (text.length < MIN_LENGTH) return { ok: true, results: [] };
  const params = new URLSearchParams({ q: text, lang: 'fr', limit: '6' });
  if (near) {
    params.set('lon', near[0].toFixed(2));
    params.set('lat', near[1].toFixed(2));
  }
  try {
    const response = await fetch(`https://${ADDRESS_SEARCH_HOST}/api/?${params.toString()}`, {
      signal,
    });
    if (!response.ok) return { ok: false, reason: 'offline' };
    const data: unknown = await response.json();
    return { ok: true, results: readPhotonResults(data) };
  } catch {
    // Aborted by a newer search, or no network: the screen says so in French.
    return { ok: false, reason: 'offline' };
  }
}
