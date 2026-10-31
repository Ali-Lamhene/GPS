import { Pressable, StyleSheet, View } from 'react-native';

import type { Place } from '@/domain/place';
import { Icon, type IconName } from '@/ui/icon/icon';
import { PlaceVisual } from '@/ui/components/place-visual';
import { PulseRing } from '@/ui/components/pulse-ring';
import { colors, shadows } from '@/ui/theme';

const RADIUS = 32;

type Look = 'call' | 'chosenStart' | 'chosenEnd' | 'idle';

const LOOKS: Record<Look, { background: string; ink: string; shadow?: string }> = {
  /** The next tile to touch: blue and pulsing. */
  call: { background: colors.primary, ink: colors.onPrimary, shadow: shadows.low },
  chosenStart: { background: colors.secondaryContainer, ink: colors.ink, shadow: shadows.low },
  chosenEnd: { background: colors.ink, ink: colors.white, shadow: shadows.low },
  /** Not available yet. */
  idle: { background: colors.surfaceHigh, ink: colors.inkFaint },
};

type TripEndpointProps = {
  end: 'origin' | 'destination';
  place?: Place;
  pulsing: boolean;
  size: number;
  onPress: () => void;
  disabled?: boolean;
};

/** Start or end tile on the home trail: empty with its symbol, or showing the chosen place. */
export function TripEndpoint({ end, place, pulsing, size, onPress, disabled }: TripEndpointProps) {
  const isStart = end === 'origin';
  const look: Look = place ? (isStart ? 'chosenStart' : 'chosenEnd') : pulsing ? 'call' : 'idle';
  const { background, ink, shadow } = LOOKS[look];
  const endSymbol: IconName = isStart ? 'trip_origin' : 'flag';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isStart ? 'Départ' : 'Arrivée'}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.tile,
        { width: size, height: size, backgroundColor: background, boxShadow: shadow },
      ]}
    >
      {pulsing && <PulseRing borderRadius={RADIUS} />}
      <View style={styles.content}>
        {place ? (
          <PlaceVisual
            place={place}
            iconSize={isStart ? 56 : 60}
            badgeSize={40}
            badge="corner"
            color={ink}
          />
        ) : (
          <Icon name={endSymbol} size={isStart ? 56 : 60} color={ink} />
        )}
      </View>
      {place && (
        <View style={[styles.badge, { backgroundColor: isStart ? colors.ink : colors.primary }]}>
          <Icon name={endSymbol} size={20} color={colors.white} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: RADIUS,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: RADIUS - 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
