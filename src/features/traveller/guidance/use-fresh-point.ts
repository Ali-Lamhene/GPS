import { useEffect, useState } from 'react';

import type { LngLat } from '@/domain/geo';

/**
 * Without a new point for this long, the position counts as lost: the phone keeps the last
 * point in the metro, a tunnel or a corridor, so a stale point must not block the touch on
 * the instruction (spec 021).
 */
export const STALE_POINT_MS = 30_000;

/** True while the last point is recent. Every update brings a new point, even in place. */
export function useFreshPoint(point: LngLat | undefined): boolean {
  // The point that went stale; a new point is fresh again until its own timer runs out.
  const [stale, setStale] = useState<LngLat | undefined>(undefined);
  useEffect(() => {
    if (!point) return;
    const timer = setTimeout(() => setStale(point), STALE_POINT_MS);
    return () => clearTimeout(timer);
  }, [point]);
  return point !== undefined && point !== stale;
}
