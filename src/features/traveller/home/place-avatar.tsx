import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { CURRENT_POSITION, isLocalPicture, type Place } from '@/domain/place';
import { placeCategory } from '@/domain/place-category';
import { PulseRing } from '@/ui/components/pulse-ring';
import { Icon, type IconName } from '@/ui/icon/icon';
import { colors } from '@/ui/theme';

type PlaceAvatarProps = {
  /** The place shown; empty shows the symbol of the end to fill. */
  place?: Place;
  emptySymbol?: IconName;
  size: number;
  /** The next thing to fill: pulsing. */
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
 * Round disc that stands for an end of the way (specs 005, 007): the location pin on pale
 * blue for "here"; the place's photo with its pictogram in a chip of its family colour; or
 * the white pictogram on that colour. Empty: a dashed blue ring around the end symbol.
 * The end symbol, if any, keeps the top-right corner, diagonal from the pictogram chip.
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
  const borderRadius = size / 2;
  const here = place?.id === CURRENT_POSITION.id;
  const tint = place ? colors.category[placeCategory(place.icon)] : colors.white;
  const photo = showPhoto && place?.photo && isLocalPicture(place.photo) ? place.photo : undefined;
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: here ? colors.primaryTint : tint,
        },
        !place && styles.empty,
        place && ringed && styles.ring,
      ]}
    >
      {pulsing && <PulseRing borderRadius={borderRadius} />}
      {here ? (
        <Icon name="location_on" size={Math.round(size * 0.55)} color={colors.primary} />
      ) : photo ? (
        <Image
          source={{ uri: photo }}
          contentFit="cover"
          style={[StyleSheet.absoluteFill, { borderRadius }]}
        />
      ) : (
        <Icon
          name={place ? place.icon : emptySymbol}
          size={Math.round(size * (place ? 0.5 : 0.45))}
          color={place ? colors.white : colors.primary}
        />
      )}
      {place && photo && (
        <View style={[styles.placeBadge, { backgroundColor: tint }]}>
          <Icon name={place.icon} size={16} color={colors.white} />
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
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  ring: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  endBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeBadge: {
    position: 'absolute',
    bottom: -4,
    left: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
