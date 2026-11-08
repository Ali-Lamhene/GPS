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
import { PlaceFace } from '@/ui/components/place-face';
import { Icon, type IconName } from '@/ui/icon/icon';
import { colors, shadows, spacing } from '@/ui/theme';

import type { TripEnd } from '../trip-plan/trip-plan-reducer';

/** The round ends: large on the home (spec 011), compact in the headers of E06 to E08. */
const END_SIZES = { large: 56, compact: 42 } as const;
const DOT_COUNT = 12;

/** The place shown in a disc of the way: « here » wears the target. */
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
  /** The end to fill now: an emerald halo grows and fades around it. */
  calling: boolean;
  /** None on the screens after the home: the pill only reminds the trip (spec 010). */
  onPress?: () => void;
  size: number;
};

function EndDisc({ end, place, calling, onPress, size }: EndDiscProps) {
  const round = { width: size, height: size, borderRadius: size / 2 };
  const iconSize = Math.round(size * 0.57);
  const haloStyle = useCall(calling);
  const symbol: IconName = end === 'origin' ? 'location_on' : 'flag';
  const label = end === 'origin' ? 'Départ' : 'Arrivée';
  const content = (
    <>
      <Animated.View pointerEvents="none" style={[styles.halo, round, haloStyle]} />
      {/* Distinct keys: Android kept the old native view and drew the new border square
          after « cancel » (field feedback, 2026-11-05). A fresh view takes the radius. */}
      {place ? (
        <View key="place" style={[styles.disc, round]}>
          <View style={[styles.clip, { borderRadius: size / 2 }]}>
            {/* Seen as soon as the app opens: a hidden place shows no facade (spec 005). */}
            <PlaceFace
              place={endPlace(place)}
              iconSize={iconSize}
              showPhoto={!isHiddenOnMap(place)}
            />
          </View>
          {/* The end stays known by its symbol, not its side (spec 006). */}
          <View style={styles.badge}>
            <Icon
              name={symbol}
              size={size > 50 ? 18 : 15}
              color={colors.white}
              variant="outlined"
            />
          </View>
        </View>
      ) : (
        // The end to fill also differs at rest: thick emerald ring, the other one muted.
        <View
          key="empty"
          style={[styles.disc, round, styles.empty, calling && styles.emptyCalling]}
        >
          <Icon
            name={symbol}
            size={iconSize}
            color={calling ? colors.emerald : colors.inkMuted}
            variant="outlined"
          />
        </View>
      )}
    </>
  );
  if (!onPress) {
    return (
      <View accessibilityLabel={label} style={[styles.slot, round]}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: calling }}
      onPress={onPress}
      style={[styles.slot, round]}
    >
      {content}
    </Pressable>
  );
}

/** The way between the ends: emerald dots, all filled, a path and nothing more (spec 009). */
function Dots() {
  return (
    <View style={styles.dots}>
      {Array.from({ length: DOT_COUNT }, (_, i) => (
        <View key={i} style={styles.dot} />
      ))}
    </View>
  );
}

type WayCardProps = {
  origin?: Place;
  destination?: Place;
  /** The end the cards below fill, if any. */
  calling?: TripEnd;
  /** Touching an end on the home; none elsewhere, where the pill is a reminder. */
  onEnd?: (end: TripEnd) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  /** Large on the home, compact in a header beside other buttons. */
  size?: keyof typeof END_SIZES;
};

/**
 * The way at the top of the home (spec 009): start ····· arrival in a floating white pill.
 * Nothing is chosen at first; the end to fill calls with a halo, the start then the arrival.
 */
export function WayCard({
  origin,
  destination,
  calling,
  onEnd,
  onLayout,
  size = 'compact',
}: WayCardProps) {
  const end = END_SIZES[size];
  const padding = size === 'large' ? spacing.sm : spacing.xs;
  return (
    // Never mirrored, like the map (spec 006).
    <View
      style={[
        styles.card,
        { padding, borderRadius: (end + 2 * padding) / 2 },
        I18nManager.isRTL && styles.unmirrored,
      ]}
      onLayout={onLayout}
    >
      <EndDisc
        end="origin"
        place={origin}
        calling={calling === 'origin'}
        onPress={onEnd && (() => onEnd('origin'))}
        size={end}
      />
      <Dots />
      <EndDisc
        end="destination"
        place={destination}
        calling={calling === 'destination'}
        onPress={onEnd && (() => onEnd('destination'))}
        size={end}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.warmWhite,
    boxShadow: shadows.warm,
  },
  unmirrored: {
    // In a right-to-left layout, 'row-reverse' lays the row out left to right again.
    flexDirection: 'row-reverse',
  },
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    backgroundColor: colors.emerald,
  },
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clip: {
    ...StyleSheet.absoluteFill,
    borderWidth: 2,
    borderColor: colors.emerald,
    overflow: 'hidden',
  },
  empty: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.warmEdge,
  },
  emptyCalling: {
    borderWidth: 3,
    borderColor: colors.emerald,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.white,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.emerald,
  },
});
