import { StyleSheet, View } from 'react-native';

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
};

/**
 * Small still map on the help card: where the traveller is and where they go, for the
 * passer-by who reads the message (spec 002). Before leaving, the whole trip.
 */
export function HelpSituationMap({ legs, step, destination }: HelpSituationMapProps) {
  const position = step && tripPosition(legs, step.legIndex, step.legFraction);
  const end = legs.at(-1)?.path.at(-1);
  return (
    <View style={styles.card}>
      {position && step ? (
        <TripMap
          camera={{ center: position.point, zoom: 16.5 }}
          lines={tripLines(legs, step)}
          stops={tripStops(legs)}
          traveller={{ point: position.point }}
          destination={end && { point: end, icon: destination?.icon ?? 'flag' }}
          interactive={false}
        />
      ) : (
        <TripOverviewMap legs={legs} destination={destination} top={0} bottom={0} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 160,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.mapGround,
    borderWidth: 1,
    borderColor: colors.surfaceHighest,
  },
});
