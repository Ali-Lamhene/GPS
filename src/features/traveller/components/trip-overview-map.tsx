import { pathsBounds } from '@/domain/geo';
import type { Place } from '@/domain/place';
import type { Leg } from '@/domain/trip';
import { TripMap } from '@/ui/map/trip-map';

import { tripLines, tripStops } from './trip-map-layers';

type TripOverviewMapProps = {
  legs: readonly Leg[];
  destination?: Place;
  /** Space taken by the header and the sheet, so the whole trip stays in view. */
  top: number;
  bottom: number;
  /** Leg to frame; the whole trip when absent. */
  focusLeg?: number;
};

/** The whole trip on the map before leaving (E06, E07): start, route, stops, arrival. */
export function TripOverviewMap({
  legs,
  destination,
  top,
  bottom,
  focusLeg,
}: TripOverviewMapProps) {
  const start = legs[0]?.path[0];
  const end = legs.at(-1)?.path.at(-1);
  const focused = focusLeg === undefined ? undefined : legs[focusLeg];
  const bounds = pathsBounds(focused ? [focused.path] : legs.map((leg) => leg.path));
  if (!start || !bounds) return null;
  return (
    <TripMap
      camera={{ center: start, zoom: 14, bounds, padding: { top, bottom } }}
      lines={tripLines(legs)}
      stops={tripStops(legs)}
      traveller={{ point: start }}
      destination={end && { point: end, icon: destination?.icon ?? 'flag' }}
      controlsBottom={bottom + 8}
    />
  );
}
