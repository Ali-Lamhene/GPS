import { I18nManager, StyleSheet, View } from 'react-native';

import { CURRENT_POSITION, type Place } from '@/domain/place';
import { PlaceArt } from '@/ui/components/place-art';
import { Icon, type IconName } from '@/ui/icon/icon';
import { colors, shadows } from '@/ui/theme';

const SIZES = {
  sm: { disc: 44, icon: 24, badge: 24 },
  md: { disc: 52, icon: 28, badge: 26 },
} as const;

type TripEndsProps = {
  origin?: Place;
  destination?: Place;
  size: keyof typeof SIZES;
};

function End({
  place,
  symbol,
  size,
}: {
  place?: Place;
  symbol: IconName;
  size: (typeof SIZES)[keyof typeof SIZES];
}) {
  const shown =
    place?.id === CURRENT_POSITION.id ? { ...place, icon: 'my_location' as const } : place;
  return (
    <View style={{ width: size.disc, height: size.disc }}>
      <View style={[styles.disc, { borderRadius: size.disc / 2 }]}>
        {shown ? (
          <PlaceArt place={shown} iconSize={size.icon} showPhoto={false} />
        ) : (
          <Icon name={symbol} size={size.icon} color={colors.inkMuted} />
        )}
      </View>
      <View
        style={[
          styles.badge,
          { width: size.badge, height: size.badge, borderRadius: size.badge / 2 },
        ]}
      >
        <Icon name={symbol} size={size.badge - 8} color={colors.white} />
      </View>
    </View>
  );
}

/**
 * Reminder of the trip being prepared (spec 008): the start and the arrival in their
 * colours, joined by dots. No arrow: the ends tell themselves apart by their symbol (pin,
 * flag), whatever the reading direction (spec 006).
 */
export function TripEnds({ origin, destination, size }: TripEndsProps) {
  const dims = SIZES[size];
  return (
    <View style={[styles.row, I18nManager.isRTL && styles.unmirrored]}>
      <End place={origin} symbol="location_on" size={dims} />
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.dot} />
        ))}
      </View>
      <End place={destination} symbol="flag" size={dims} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: colors.white,
    boxShadow: shadows.floating,
  },
  unmirrored: {
    flexDirection: 'row-reverse',
  },
  disc: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLow,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
