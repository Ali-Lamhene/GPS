import { StyleSheet, View } from 'react-native';

import { pathsBounds } from '@/domain/geo';
import type { GuidanceStep } from '@/domain/guidance';
import type { Place } from '@/domain/place';
import { tripPosition, type Leg } from '@/domain/trip';
import { TripMap } from '@/ui/map/trip-map';
import { colors } from '@/ui/theme';

import { tripLines, tripStops } from '../components/trip-map-layers';
import { TripOverviewMap } from '../components/trip-overview-map';

type HelpSituationMapProps = {
  legs: readonly Leg[];
  /** The guidance step the traveller is on, if the trip has started. */
  step?: GuidanceStep;
  destination?: Place;
  origin?: Place;
};

/**
 * Small still map on the help card, for the passer-by who reads the message (spec 002):
 * the traveller and the end of their current leg (the stop or place they look for); the
 * whole trip before leaving.
 */
export function HelpSituationMap({ legs, step, destination, origin }: HelpSituationMapProps) {
  const position = step && tripPosition(legs, step.legIndex, step.legFraction);
  const target = step && legs[step.legIndex]?.path.at(-1);
  const end = legs.at(-1)?.path.at(-1);
  const bounds = position && target && pathsBounds([[position.point, target]]);
  return (
    <View style={styles.card}>
      {position && step && bounds ? (
        <TripMap
          camera={{ center: position.point, zoom: 16.5, bounds }}
          lines={tripLines(legs, step)}
          stops={tripStops(legs)}
          traveller={{ point: position.point }}
          destination={end && { point: end, icon: destination?.icon ?? 'flag' }}
          interactive={false}
        />
      ) : (
        <TripOverviewMap
          legs={legs}
          origin={origin}
          destination={destination}
          top={0}
          bottom={0}
          interactive={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.mapGround,
    borderWidth: 1,
    borderColor: colors.surfaceHighest,
  },
});
