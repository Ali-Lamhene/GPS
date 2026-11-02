import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { isLocalPicture, type Place } from '@/domain/place';
import { categoryOfIcon } from '@/domain/place-category';
import { Icon } from '@/ui/icon/icon';
import { colors } from '@/ui/theme';

import { VividFill } from './vivid-fill';

type PlaceArtProps = {
  place: Place;
  /** Size of the white pictogram on the colour. */
  iconSize: number;
  /**
   * Whether the photo may show. Required: a place kept off the map (home, family) must
   * never show its facade on the home, so every screen decides explicitly.
   */
  showPhoto: boolean;
  /** Where the pictogram sits without a photo. */
  iconAt?: 'center' | 'corner';
  /** A very large faded pictogram running off the bottom-right corner (big cards). */
  faded?: number;
  /** Size of the white square that carries the pictogram over a photo; none hides it. */
  badgeSize?: number;
  /** A veil of the family's deep colour at the bottom of the photo (big cards). */
  veil?: boolean;
};

/** Veil of the place's deep colour at the bottom of its photo, under the pictogram. */
function PhotoVeil({ color }: { color: string }) {
  const id = `veil-${color.slice(1)}`;
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0.45" stopColor={color} stopOpacity={0} />
          <Stop offset="1" stopColor={color} stopOpacity={0.85} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

/**
 * What identifies a place, the same everywhere (spec 008): the vivid colour of its family
 * with its white pictogram, or its photo with the pictogram in a white square. Fills its
 * parent, which sets the size, the shape and `overflow: 'hidden'`.
 */
export function PlaceArt({
  place,
  iconSize,
  showPhoto,
  iconAt = 'center',
  faded,
  badgeSize,
  veil = false,
}: PlaceArtProps) {
  const photo = showPhoto && place.photo && isLocalPicture(place.photo) ? place.photo : undefined;
  const deep = colors.category[categoryOfIcon(place.icon)];
  return (
    <>
      <VividFill icon={place.icon} />
      {photo ? (
        <>
          <Image source={{ uri: photo }} contentFit="cover" style={StyleSheet.absoluteFill} />
          {veil && <PhotoVeil color={deep} />}
          {badgeSize !== undefined && (
            <View
              style={[
                styles.badge,
                { width: badgeSize, height: badgeSize, borderRadius: badgeSize * 0.3 },
              ]}
            >
              <Icon name={place.icon} size={Math.round(badgeSize * 0.58)} color={deep} />
            </View>
          )}
        </>
      ) : (
        <>
          {faded !== undefined && (
            <View
              style={[styles.faded, { right: -faded * 0.2, bottom: -faded * 0.24 }]}
              pointerEvents="none"
            >
              <Icon name={place.icon} size={faded} color={colors.whiteFaded} />
            </View>
          )}
          <View style={iconAt === 'corner' ? styles.corner : styles.center}>
            <Icon name={place.icon} size={iconSize} color={colors.white} />
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    left: 20,
    top: 20,
  },
  faded: {
    position: 'absolute',
  },
  badge: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 2px 8px rgba(0,0,0,.25)`,
  },
});
