import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { isLocalPicture } from '@/domain/place';
import { Icon, type IconName } from '@/ui/icon/icon';
import { PIN_BOX, PIN_PATH, pinFace, pinWidth } from '@/ui/map/pin-shape';
import { colors } from '@/ui/theme';

export type PlacePinProps = {
  icon: IconName;
  photo: string | undefined;
  selected: boolean;
};

/**
 * A saved place the traveller can touch (spec 009): a white teardrop edged in emerald with
 * the emerald outlined pictogram, or the place's photo in its round head with the
 * pictogram in a small white disc. The chosen place is larger and solid emerald.
 */
export function PlacePin({ icon, photo, selected }: PlacePinProps) {
  const width = pinWidth(selected);
  const face = pinFace(width, selected);
  const picture = photo !== undefined && isLocalPicture(photo) ? photo : undefined;
  return (
    <View style={{ width, height: face.height }}>
      <View style={[styles.pinShadow, { left: width / 2 - 9 }]} />
      <Svg
        width={width}
        height={face.height}
        viewBox={`0 0 ${PIN_BOX.width} ${PIN_BOX.height}`}
        style={StyleSheet.absoluteFill}
      >
        <Path
          d={PIN_PATH}
          fill={selected ? colors.emerald : colors.white}
          stroke={colors.emerald}
          strokeWidth={selected ? 0 : 2.2}
        />
      </Svg>
      <View
        style={[
          styles.pinFace,
          {
            left: face.left,
            top: face.top,
            width: face.size,
            height: face.size,
            borderRadius: face.size / 2,
          },
        ]}
      >
        {picture ? (
          <Image source={{ uri: picture }} contentFit="cover" style={StyleSheet.absoluteFill} />
        ) : (
          <Icon
            name={icon}
            size={Math.round(face.size * 0.62)}
            color={colors.emerald}
            variant="outlined"
          />
        )}
      </View>
      {picture && (
        <View style={[styles.pinBadge, { left: face.left - 4, top: face.top + face.size - 16 }]}>
          <Icon name={icon} size={13} color={colors.emerald} variant="outlined" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pinShadow: {
    position: 'absolute',
    bottom: -3,
    width: 18,
    height: 6,
    borderRadius: 9,
    backgroundColor: 'rgba(17,24,39,.14)',
  },
  pinFace: {
    position: 'absolute',
    backgroundColor: colors.white,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBadge: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,.3)',
  },
});
