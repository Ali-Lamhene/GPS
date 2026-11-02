import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { isHiddenOnMap, isLocalPicture, type Place } from '@/domain/place';
import { placeCategory } from '@/domain/place-category';
import { Icon } from '@/ui/icon/icon';
import { colors, radii, spacing } from '@/ui/theme';

type PlaceCardProps = {
  place: Place;
  width: number;
  height: number;
  disabled?: boolean;
  onPress: () => void;
};

/**
 * Card of the home carousel (spec 007). A photo fills it, with the pictogram in a chip of
 * the place's family colour. Without a photo, or for a place kept off the map (seen as
 * soon as the app opens, so no facade), an illustrated tile: family colour, a large faded
 * pictogram running off the corner, the pictogram in white.
 */
export function PlaceCard({ place, width, height, disabled = false, onPress }: PlaceCardProps) {
  const tint = colors.category[placeCategory(place.icon)];
  const photo =
    !isHiddenOnMap(place) && place.photo && isLocalPicture(place.photo) ? place.photo : undefined;
  const short = Math.min(width, height);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={place.helpName ?? 'Lieu'}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { width, height, backgroundColor: tint },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {photo ? (
        <>
          <Image source={{ uri: photo }} contentFit="cover" style={StyleSheet.absoluteFill} />
          <View style={[styles.chip, { backgroundColor: tint }]}>
            <Icon name={place.icon} size={20} color={colors.white} />
          </View>
        </>
      ) : (
        <>
          <View style={[styles.faded, { right: -short * 0.28, bottom: -short * 0.3 }]}>
            <Icon name={place.icon} size={Math.round(short * 1.05)} color={colors.whiteFaded} />
          </View>
          <Icon name={place.icon} size={Math.round(short * 0.4)} color={colors.white} />
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.placeCard,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.38,
  },
  faded: {
    position: 'absolute',
  },
  chip: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: radii.control,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
