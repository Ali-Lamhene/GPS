import { useEffect } from 'react';
import { I18nManager, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { CURRENT_POSITION, isHiddenOnMap, type Place } from '@/domain/place';
import { PlaceArt } from '@/ui/components/place-art';
import { Icon, type IconName } from '@/ui/icon/icon';
import { colors, radii, shadows, spacing } from '@/ui/theme';

import type { TripEnd } from '../trip-plan/trip-plan-reducer';

/** The discs of the way: large, so the next thing to do is plain (spec 008). */
const END_SIZE = 76;

/** The place shown in a disc of the way: « here » wears the target, on the action blue. */
function endPlace(place: Place): Place {
  return place.id === CURRENT_POSITION.id ? { ...place, icon: 'my_location' } : place;
}

/** Halo that grows and fades around the end to fill; still and pale when motion is reduced. */
function useCall(active: boolean) {
  const reduced = useReducedMotion();
  const halo = useSharedValue(0);
  useEffect(() => {
    if (!active || reduced) {
      cancelAnimation(halo);
      halo.value = 0;
      return;
    }
    halo.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }), -1);
  }, [active, reduced, halo]);
  return useAnimatedStyle(() => {
    if (!active) return { opacity: 0, transform: [{ scale: 1 }] };
    // Reduced motion: a still, pale halo, so the end to fill still stands out in the sun.
    if (reduced) return { opacity: 0.25, transform: [{ scale: 1.22 }] };
    return { opacity: 0.55 * (1 - halo.value), transform: [{ scale: 1 + 0.45 * halo.value }] };
  });
}

type EndDiscProps = {
  end: TripEnd;
  place?: Place;
  /** The end to fill now: dashed blue, with a halo. */
  calling: boolean;
  onPress: () => void;
};

function EndDisc({ end, place, calling, onPress }: EndDiscProps) {
  const haloStyle = useCall(calling);
  const symbol: IconName = end === 'origin' ? 'location_on' : 'flag';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={end === 'origin' ? 'Départ' : 'Arrivée'}
      accessibilityState={{ selected: calling }}
      onPress={onPress}
      style={styles.slot}
    >
      <Animated.View pointerEvents="none" style={[styles.halo, haloStyle]} />
      {place ? (
        <View style={styles.disc}>
          <View style={styles.clip}>
            {/* Seen as soon as the app opens: a hidden place shows no facade (spec 005). */}
            <PlaceArt place={endPlace(place)} iconSize={36} showPhoto={!isHiddenOnMap(place)} />
          </View>
          <View style={styles.badge}>
            <Icon name={symbol} size={14} color={colors.white} />
          </View>
        </View>
      ) : (
        <View style={[styles.disc, styles.empty, calling && styles.emptyCalling]}>
          <Icon name={symbol} size={34} color={calling ? colors.primary : colors.inkMuted} />
        </View>
      )}
    </Pressable>
  );
}

/** Dotted way, drawn with dots: Android cannot dot a single border side. */
function Dots({ color }: { color: string }) {
  return (
    <View style={styles.dots}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[styles.dot, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

type WayCardProps = {
  origin?: Place;
  destination?: Place;
  /** The end the cards below fill, if any. */
  calling?: TripEnd;
  onEnd: (end: TripEnd) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
};

/**
 * The way at the top of the home (spec 008): start, walker, arrival, in a floating card.
 * Nothing is chosen at first; the end to fill calls with a halo, the start then the arrival.
 */
export function WayCard({ origin, destination, calling, onEnd, onLayout }: WayCardProps) {
  const ready = origin !== undefined && destination !== undefined;
  const way = ready ? colors.primary : colors.emptyRing;
  return (
    // Never mirrored, like the map: the walker always faces the arrival.
    <View style={[styles.card, I18nManager.isRTL && styles.unmirrored]} onLayout={onLayout}>
      <EndDisc
        end="origin"
        place={origin}
        calling={calling === 'origin'}
        onPress={() => onEnd('origin')}
      />
      <Dots color={way} />
      <View style={[styles.walker, ready && styles.walkerReady]}>
        <Icon name="directions_walk" size={26} color={colors.white} />
      </View>
      <Dots color={way} />
      <EndDisc
        end="destination"
        place={destination}
        calling={calling === 'destination'}
        onPress={() => onEnd('destination')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sheet,
    backgroundColor: colors.white,
    boxShadow: shadows.float,
  },
  unmirrored: {
    // In a right-to-left layout, 'row-reverse' lays the row out left to right again.
    flexDirection: 'row-reverse',
  },
  slot: {
    width: END_SIZE,
    height: END_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: END_SIZE,
    height: END_SIZE,
    borderRadius: END_SIZE / 2,
    backgroundColor: colors.primary,
  },
  disc: {
    width: END_SIZE,
    height: END_SIZE,
    borderRadius: END_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clip: {
    ...StyleSheet.absoluteFill,
    borderRadius: END_SIZE / 2,
    overflow: 'hidden',
  },
  // Empty stays visibly empty, even while it calls: white, dashed, the end symbol in
  // outline colour. Only a chosen place fills it with colour.
  empty: {
    backgroundColor: colors.white,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.emptyRing,
  },
  emptyCalling: {
    borderColor: colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  walker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkerReady: {
    backgroundColor: colors.primary,
  },
});
