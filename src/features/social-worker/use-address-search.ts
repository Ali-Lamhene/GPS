import { useEffect, useState } from 'react';

import type { AddressResult } from '@/domain/address';
import type { LngLat } from '@/domain/geo';
import { searchAddresses } from '@/services/address-search';

export type AddressSearchState =
  | { kind: 'idle' }
  | { kind: 'searching' }
  | { kind: 'results'; results: AddressResult[] }
  | { kind: 'none' }
  | { kind: 'offline' };

type Answer = Exclude<AddressSearchState, { kind: 'idle' } | { kind: 'searching' }>;

/** Waits for a pause in typing before asking Photon: fewer requests, less sent. */
const PAUSE_MS = 350;
const MIN_LENGTH = 3;

/** Suggestions while the companion types (spec 001), for the newest text only. */
export function useAddressSearch(query: string, near?: LngLat): AddressSearchState {
  const [answer, setAnswer] = useState<{ query: string; state: Answer } | null>(null);
  const nearLng = near?.[0];
  const nearLat = near?.[1];
  const searchable = query.trim().length >= MIN_LENGTH;

  useEffect(() => {
    if (!searchable) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const around =
        nearLng !== undefined && nearLat !== undefined ? ([nearLng, nearLat] as const) : undefined;
      searchAddresses(query, controller.signal, around).then((result) => {
        if (controller.signal.aborted) return;
        const state: Answer = !result.ok
          ? { kind: 'offline' }
          : result.results.length
            ? { kind: 'results', results: result.results }
            : { kind: 'none' };
        setAnswer({ query, state });
      });
    }, PAUSE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, searchable, nearLng, nearLat]);

  if (!searchable) return { kind: 'idle' };
  return answer?.query === query ? answer.state : { kind: 'searching' };
}
