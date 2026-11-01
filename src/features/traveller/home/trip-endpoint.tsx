import { Pressable, StyleSheet, View } from 'react-native';

import { CURRENT_POSITION, type Place } from '@/domain/place';
import { Icon, type IconName } from '@/ui/icon/icon';
import { PlaceVisual } from '@/ui/components/place-visual';
import { PulseRing } from '@/ui/components/pulse-ring';
import { colors, radii, sizes } from '@/ui/theme';

type Look = 'call' | 'chosenStart' | 'chosenEnd' | 'idle';

const LOOKS: Record<Look, { background: string; edge: string; ink: string }> = {
  /** The next box to fill: blue and pulsing. */
  call: { background: colors.primary, edge: colors.primary, ink: colors.onPrimary },
  // Filled boxes keep apart by their edge, not only by their place in the column.
  chosenStart: { background: colors.white, edge: colors.outline, ink: colors.ink },
  chosenEnd: { background: colors.white, edge: colors.primary, ink: colors.ink },
  /** Not available yet. */
  idle: { background: colors.surfaceHigh, edge: colors.surfaceHigh, ink: colors.inkFaint },
};

type TripEndpointProps = {
  end: 'origin' | 'destination';
  place?: Place;
  pulsing: boolean;
  onPress: () => void;
  disabled?: boolean;
};

/** Start or arrival box of the home column: empty with its symbol, or the chosen place. */
export function TripEndpoint({ end, place, pulsing, onPress, disabled }: TripEndpointProps) {
  const isStart = end === 'origin';
  const look: Look = place ? (isStart ? 'chosenStart' : 'chosenEnd') : pulsing ? 'call' : 'idle';
  const { background, edge, ink } = LOOKS[look];
  const endSymbol: IconName = isStart ? 'trip_origin' : 'flag';
  const here = place?.id === CURRENT_POSITION.id;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isStart ? 'Départ' : 'Arrivée'}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.box, { backgroundColor: background, borderColor: edge }]}
    >
      {pulsing && <PulseRing borderRadius={radii.control} />}
      <View style={styles.content}>
        {here ? (
          // The same blue dot as on the map: "you are here".
          <View style={styles.here} />
        ) : place ? (
          <PlaceVisual place={place} iconSize={34} badgeSize={28} badge="corner" color={ink} />
        ) : (
          <Icon name={endSymbol} size={34} color={ink} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: sizes.minTarget,
    height: sizes.minTarget,
    borderRadius: radii.control,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  here: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.white,
    boxShadow: `0 0 0 2px ${colors.onSecondaryContainer}`,
  },
  content: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: radii.control - 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
