import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { CURRENT_POSITION, isLocalPicture, type Place } from '@/domain/place';
import { PulseRing } from '@/ui/components/pulse-ring';
import { Icon, type IconName } from '@/ui/icon/icon';
import { colors } from '@/ui/theme';

type PlaceAvatarProps = {
  /** The place shown; empty shows the symbol of the end to fill. */
  place?: Place;
  emptySymbol?: IconName;
  size: number;
  /** The next thing to fill: blue and pulsing. */
  pulsing?: boolean;
  /**
   * Symbol of the end in a corner once filled (start, arrival): the ends keep apart by
   * their symbol, not by their order, whatever the reading direction.
   */
  badge?: IconName;
  /** Blue ring once filled, like the chosen pin on the map. */
  ringed?: boolean;
  /** False keeps a photo out of sight (a place hidden from the map, spec 005). */
  showPhoto?: boolean;
};

/**
 * Round light-blue disc that stands for a place (spec 005): the same blue dot as on the map
 * for "here", otherwise the place's photo with its pictogram in the bottom-left corner, or
 * the pictogram alone. The end symbol, if any, keeps the opposite top-right corner.
 */
export function PlaceAvatar({
  place,
  emptySymbol = 'flag',
  size,
  pulsing = false,
  badge,
  ringed = false,
  showPhoto = true,
}: PlaceAvatarProps) {
  const here = place?.id === CURRENT_POSITION.id;
  const photo = showPhoto && place?.photo && isLocalPicture(place.photo) ? place.photo : undefined;
  const background = place
    ? here
      ? colors.primaryTint
      : colors.secondaryContainer
    : pulsing
      ? colors.primary
      : colors.surfaceHigh;
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: background },
        place && ringed && styles.ring,
      ]}
    >
      {pulsing && <PulseRing borderRadius={size / 2} />}
      {here ? (
        <View style={styles.dot} />
      ) : photo ? (
        <Image
          source={{ uri: photo }}
          contentFit="cover"
          style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
        />
      ) : (
        <Icon
          name={place ? place.icon : emptySymbol}
          size={Math.round(size * 0.48)}
          color={place ? colors.ink : pulsing ? colors.onPrimary : colors.inkFaint}
        />
      )}
      {place && photo && (
        <View style={styles.placeBadge}>
          <Icon name={place.icon} size={18} color={colors.ink} />
        </View>
      )}
      {place && !here && badge && (
        <View style={styles.endBadge}>
          <Icon name={badge} size={14} color={colors.white} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  endBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Diagonal from the end symbol; dark ring and shadow like a pin, seen on a pale photo.
  placeBadge: {
    position: 'absolute',
    bottom: -4,
    left: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 0 1px rgba(0,0,0,.28), 0 2px 6px rgba(0,0,0,.3)',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.white,
    boxShadow: `0 0 0 2px ${colors.onSecondaryContainer}`,
  },
});
