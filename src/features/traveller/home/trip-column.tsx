import { StyleSheet, View } from 'react-native';

import type { Place } from '@/domain/place';
import { Icon } from '@/ui/icon/icon';
import { colors, radii, sizes } from '@/ui/theme';

import { TripEndpoint } from './trip-endpoint';

/** Width of the column floating over the home map, so the map keeps its places beside it. */
export const TRIP_COLUMN_WIDTH = sizes.minTarget + 16;

type TripColumnProps = {
  origin?: Place;
  destination?: Place;
  onOrigin: () => void;
  onDestination: () => void;
};

/**
 * The vertical trip of the home (rule 3 of docs/screens.md, spec 005): start on top, a
 * walker on the dotted way, arrival at the bottom. Vertical, it reads the same whatever
 * the traveller's reading direction.
 */
export function TripColumn({ origin, destination, onOrigin, onDestination }: TripColumnProps) {
  const ready = origin !== undefined && destination !== undefined;
  const dot = ready ? colors.primary : colors.inkDisabled;
  const dots = (key: string) => (
    <View style={styles.dots}>
      {[0, 1, 2].map((i) => (
        <View key={`${key}-${i}`} style={[styles.dot, { backgroundColor: dot }]} />
      ))}
    </View>
  );

  return (
    <View style={styles.column}>
      <TripEndpoint end="origin" place={origin} pulsing={!origin} onPress={onOrigin} />
      {dots('top')}
      <Icon name="directions_walk" size={30} color={ready ? colors.primary : colors.inkMuted} />
      {dots('bottom')}
      <TripEndpoint
        end="destination"
        place={destination}
        pulsing={origin !== undefined && !destination}
        disabled={!origin}
        onPress={onDestination}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    width: TRIP_COLUMN_WIDTH,
    padding: 8,
    gap: 6,
    alignItems: 'center',
    borderRadius: radii.control,
    backgroundColor: colors.white,
    boxShadow: '0 2px 10px rgba(0,0,0,.16)',
  },
  dots: {
    gap: 6,
    paddingVertical: 2,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
