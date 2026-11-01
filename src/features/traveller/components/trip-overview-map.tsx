import { pathsBounds } from '@/domain/geo';
import { CURRENT_POSITION, type Place } from '@/domain/place';
import type { Leg } from '@/domain/trip';
import { TripMap } from '@/ui/map/trip-map';

import { tripLines, tripStops } from './trip-map-layers';

type TripOverviewMapProps = {
  legs: readonly Leg[];
  origin?: Place;
  destination?: Place;
  /** Space taken by the header and the sheet, so the whole trip stays in view. */
  top: number;
  bottom: number;
  /** Leg to frame and highlight; the whole trip when absent. */
  focusLeg?: number;
  interactive?: boolean;
};

/**
 * The whole trip on the map before leaving (E06, E07): route, stops, arrival. The blue dot
 * only means "you are here" when the trip starts from the current position; a saved start
 * shows its own pictogram instead.
 */
export function TripOverviewMap({
  legs,
  origin,
  destination,
  top,
  bottom,
  focusLeg,
  interactive = true,
}: TripOverviewMapProps) {
  const start = legs[0]?.path[0];
  const end = legs.at(-1)?.path.at(-1);
  const focused = focusLeg === undefined ? undefined : legs[focusLeg];
  const bounds = pathsBounds(focused ? [focused.path] : legs.map((leg) => leg.path));
  if (!start || !bounds) return null;
  const lines = tripLines(legs).map((line, i) =>
    focused && i !== focusLeg ? { ...line, style: 'done' as const } : line,
  );
  const fromHere = !origin || origin.id === CURRENT_POSITION.id;
  return (
    <TripMap
      camera={{ center: start, zoom: 14, bounds, padding: { top, bottom } }}
      lines={lines}
      stops={tripStops(legs)}
      traveller={fromHere ? { point: start } : undefined}
      origin={fromHere ? undefined : { point: start, icon: origin.icon }}
      destination={end && { point: end, icon: destination?.icon ?? 'flag' }}
      controlsBottom={bottom + 8}
      recenterIcon="fit_screen"
      interactive={interactive}
    />
  );
}
