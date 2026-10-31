import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import type { Place } from '@/domain/place';
import { Icon } from '@/ui/icon/icon';
import { PHOTOS } from '@/ui/photos';
import { colors } from '@/ui/theme';

type PlaceVisualProps = {
  place: Place;
  /** Pictogram size when the place has no photo. */
  iconSize: number;
  /** Size of the white badge that carries the pictogram over a photo. */
  badgeSize: number;
  color: string;
  /** Badge position over the photo. */
  badge?: 'center' | 'corner';
};

/**
 * What identifies a place: its photo with the pictogram in a badge, or the pictogram
 * alone. The parent sets the size, shape and `overflow: 'hidden'`.
 */
export function PlaceVisual({
  place,
  iconSize,
  badgeSize,
  color,
  badge = 'center',
}: PlaceVisualProps) {
  if (!place.photo) return <Icon name={place.icon} size={iconSize} color={color} />;

  return (
    <>
      <Image source={PHOTOS[place.photo]} contentFit="cover" style={StyleSheet.absoluteFill} />
      <View
        style={[
          styles.badge,
          badge === 'corner' && styles.corner,
          { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 },
        ]}
      >
        <Icon name={place.icon} size={Math.round(badgeSize * 0.6)} color={colors.ink} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    left: 8,
    bottom: 8,
  },
});
