import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { isLocalPicture, type Place } from '@/domain/place';
import { Icon } from '@/ui/icon/icon';
import { colors } from '@/ui/theme';

type PlaceFaceProps = {
  place: Place;
  /** Size of the emerald pictogram on white. */
  iconSize: number;
  /**
   * Whether the photo may show. Required: a place kept off the map (home, family) must
   * never show its facade on the home, so every screen decides explicitly.
   */
  showPhoto: boolean;
  /** Size of the white disc that carries the pictogram over a photo; none hides it. */
  badgeSize?: number;
  /** « Here » without a usable position (spec 017): grey ground, grey pictogram, still sharp. */
  muted?: boolean;
};

/**
 * What identifies a place in the emerald mockup (spec 009): its emerald outlined
 * pictogram on warm white, or its photo with that pictogram in a small white disc in the
 * bottom-left corner. Fills its parent, which sets the size, the shape and
 * `overflow: 'hidden'`.
 */
export function PlaceFace({
  place,
  iconSize,
  showPhoto,
  badgeSize,
  muted = false,
}: PlaceFaceProps) {
  const photo = showPhoto && place.photo && isLocalPicture(place.photo) ? place.photo : undefined;
  if (!photo) {
    return (
      <View style={[StyleSheet.absoluteFill, styles.plain, muted && styles.muted]}>
        <Icon
          name={place.icon}
          size={iconSize}
          color={muted ? colors.outline : colors.emerald}
          variant="outlined"
        />
      </View>
    );
  }
  return (
    <>
      <Image
        source={{ uri: photo }}
        contentFit="cover"
        // Never a copy in the disk cache: a deleted place leaves no picture behind (spec 022).
        cachePolicy="memory"
        style={StyleSheet.absoluteFill}
      />
      {badgeSize !== undefined && (
        <View
          style={[
            styles.badge,
            { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 },
          ]}
        >
          <Icon
            name={place.icon}
            size={Math.round(badgeSize * 0.62)}
            color={colors.emerald}
            variant="outlined"
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  muted: {
    backgroundColor: colors.warmEdge,
  },
  plain: {
    backgroundColor: colors.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,.25)',
  },
});
