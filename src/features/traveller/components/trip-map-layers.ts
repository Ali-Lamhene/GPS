import { splitPath } from '@/domain/geo';
import type { Leg } from '@/domain/trip';
import type { MapLine, MapStop } from '@/ui/map/trip-map-types';
import { colors } from '@/ui/theme';

import { legColor } from './leg-style';

/**
 * The trip on the map: walking dotted blue, vehicles in their line colour. With the
 * traveller's position, the part already done turns grey, cut where they are.
 */
export function tripLines(
  legs: readonly Leg[],
  position?: { legIndex: number; legFraction: number },
): MapLine[] {
  return legs.flatMap((leg, i): MapLine[] => {
    const ahead: MapLine['style'] = leg.kind === 'walk' ? 'walk' : 'vehicle';
    const color = leg.kind === 'walk' ? colors.primary : legColor(leg);
    if (!position || i > position.legIndex) return [{ path: leg.path, color, style: ahead }];
    if (i < position.legIndex) return [{ path: leg.path, color, style: 'done' }];
    const [done, rest] = splitPath(leg.path, position.legFraction);
    return [
      { path: done, color, style: 'done' },
      { path: rest, color, style: ahead },
    ];
  });
}

/** Where to get on and off each vehicle. */
export function tripStops(legs: readonly Leg[]): MapStop[] {
  return legs.flatMap((leg): MapStop[] => {
    if (leg.kind !== 'bus' && leg.kind !== 'metro') return [];
    const symbol = leg.kind === 'metro' ? 'metro' : 'directions_bus';
    return [leg.path[0], leg.path.at(-1)]
      .filter((point) => point !== undefined)
      .map((point) => ({ point, color: leg.line.color, symbol }));
  });
}
