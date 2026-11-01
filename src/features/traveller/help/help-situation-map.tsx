import { StyleSheet, View } from 'react-native';

import { pathsBounds } from '@/domain/geo';
import type { GuidanceStep } from '@/domain/guidance';
import type { Place } from '@/domain/place';
import { tripPosition, type Leg } from '@/domain/trip';
import type { IconName } from '@/ui/icon/icon';
import { TripMap } from '@/ui/map/trip-map';
import { colors, radii } from '@/ui/theme';

import { tripLines, tripStops } from '../components/trip-map-layers';

type HelpSituationMapProps = {
  legs: readonly Leg[];
  /** The guidance step the traveller is on; the first leg before leaving. */
  step?: GuidanceStep;
  destination?: Place;
};

/**
 * What the passer-by sees on the help card (spec 002): the traveller and the end of their
 * current leg only, the stop or place they look for. The rest of the trip stays hidden, so
 * a stranger never sees where a private place such as home is, unless the traveller is
 * already on its last stretch.
 */
export function situationLayers(
  legs: readonly Leg[],
  step: Pick<GuidanceStep, 'legIndex' | 'legFraction'> | undefined,
  destinationIcon: IconName,
) {
  const legIndex = step?.legIndex ?? 0;
  const legFraction = step?.legFraction ?? 0;
  const leg = legs[legIndex];
  const position = tripPosition(legs, legIndex, legFraction);
  const target = leg?.path.at(-1);
  const bounds = position && target && pathsBounds([[position.point, target]]);
  if (!leg || !position || !target || !bounds) return undefined;

  const next = legs[legIndex + 1];
  // Walking to a stop: the stop to find, without the rest of the next line.
  const boarding = next && next.kind !== 'walk' ? tripStops([next]).slice(0, 1) : [];
  const last = legIndex === legs.length - 1;
  return {
    traveller: position.point,
    bounds,
    // The part already walked would show where the trip started.
    lines: tripLines([leg], { legIndex: 0, legFraction }).filter(({ style }) => style !== 'done'),
    stops: [...tripStops([leg]), ...boarding],
    destination: last ? { point: target, icon: destinationIcon } : undefined,
  };
}

/** Small still map of the situation on the help card, for the passer-by. */
export function HelpSituationMap({ legs, step, destination }: HelpSituationMapProps) {
  const layers = situationLayers(legs, step, destination?.icon ?? 'flag');
  if (!layers) return null;
  return (
    <View style={styles.card}>
      <TripMap
        camera={{ center: layers.traveller, zoom: 16.5, bounds: layers.bounds }}
        lines={layers.lines}
        stops={layers.stops}
        traveller={{ point: layers.traveller }}
        destination={layers.destination}
        interactive={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 200,
    borderRadius: radii.control,
    overflow: 'hidden',
    backgroundColor: colors.mapGround,
    borderWidth: 1,
    borderColor: colors.surfaceHighest,
  },
});
