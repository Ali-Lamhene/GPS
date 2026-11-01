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
};

/**
 * Round light-blue disc that stands for a place (spec 005): the same blue dot as on the map
 * for "here", the place's photo or pictogram otherwise.
 */
export function PlaceAvatar({
  place,
  emptySymbol = 'flag',
  size,
  pulsing = false,
  badge,
  ringed = false,
}: PlaceAvatarProps) {
  const here = place?.id === CURRENT_POSITION.id;
  const photo = place?.photo && isLocalPicture(place.photo) ? place.photo : undefined;
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
      {place && !here && badge && (
        <View style={styles.badge}>
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
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.ink,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
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
