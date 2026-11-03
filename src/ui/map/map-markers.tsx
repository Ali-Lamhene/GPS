import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { isLocalPicture } from '@/domain/place';
import { categoryOfIcon } from '@/domain/place-category';
import { VividFill } from '@/ui/components/vivid-fill';
import { Icon } from '@/ui/icon/icon';
import type { IconName } from '@/ui/icon/glyphs';
import { colors } from '@/ui/theme';

import { MapMetroLetter } from './map-texts';
import { PIN_BOX, PIN_PATH, pinFace, pinWidth } from './pin-shape';

// Markers drawn over the phone's map, the same as the browser ones (map-markers.web.ts).

function deepColor(icon: IconName): string {
  return colors.category[categoryOfIcon(icon)];
}

/** The traveller: an emerald dot ringed in white, in a pale emerald halo (spec 009). */
export function TravellerDot() {
  return (
    <View pointerEvents="none" style={styles.dotArea}>
      <View style={styles.dotHalo} />
      <View style={styles.dot} />
    </View>
  );
}

/** Cone laid in front of the traveller, pointing the way they go (screen up at 0°). */
export function TravellerCone({ rotation }: { rotation: number }) {
  return (
    <View pointerEvents="none" style={{ transform: [{ rotate: `${rotation}deg` }] }}>
      <Svg width={96} height={96}>
        <Defs>
          <RadialGradient id="cone" cx="48" cy="48" r="48" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={colors.emerald} stopOpacity={0.55} />
            <Stop offset="1" stopColor={colors.emerald} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Path d="M48 48 L25.46 5.62 A48 48 0 0 1 70.54 5.62 Z" fill="url(#cone)" />
      </Svg>
    </View>
  );
}

/** Big white arrow on a dark disc at the next corner, pointing the street to take. */
export function ManeuverArrow({ rotation }: { rotation: number }) {
  return (
    <View
      pointerEvents="none"
      style={[styles.maneuver, { transform: [{ rotate: `${rotation}deg` }] }]}
    >
      <Icon name="arrow_upward" size={32} color={colors.white} />
    </View>
  );
}

/** Destination: the place pictogram on its family colour, with a pointer (spec 008). */
export function DestinationPin({ icon }: { icon: IconName }) {
  return (
    <View pointerEvents="none" style={styles.column}>
      <View style={styles.destinationHead}>
        <VividFill icon={icon} />
        <Icon name={icon} size={28} color={colors.white} />
      </View>
      <View
        style={[styles.pointer, styles.destinationPointer, { borderTopColor: deepColor(icon) }]}
      />
    </View>
  );
}

/** Start of the trip when it is a saved place: its pictogram on its family colour. */
export function OriginPin({ icon }: { icon: IconName }) {
  return (
    <View pointerEvents="none" style={styles.origin}>
      <VividFill icon={icon} />
      <Icon name={icon} size={26} color={colors.white} />
    </View>
  );
}

type PlacePinProps = {
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

type StopPinProps = {
  symbol: IconName | 'metro';
  color: string;
  alight: boolean;
};

/** Stop where to get on or off: the vehicle pictogram, or the metro "M", in the line colour. */
export function StopPin({ symbol, color, alight }: StopPinProps) {
  const ring = alight ? `0 0 0 4px ${colors.alert}, ` : '';
  if (symbol === 'metro') {
    return (
      <View
        pointerEvents="none"
        style={[
          styles.stop,
          styles.metroStop,
          { backgroundColor: color, boxShadow: `${ring}0 2px 6px rgba(0,0,0,.3)` },
        ]}
      >
        <MapMetroLetter />
      </View>
    );
  }
  return (
    <View
      pointerEvents="none"
      style={[
        styles.stop,
        styles.vehicleStop,
        { borderColor: color, boxShadow: `${ring}0 2px 6px rgba(0,0,0,.3)` },
      ]}
    >
      <Icon name={symbol} size={24} color={colors.ink} />
    </View>
  );
}

const styles = StyleSheet.create({
  dotArea: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotHalo: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.accuracy,
    borderWidth: 1,
    borderColor: colors.accuracyEdge,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.emerald,
    borderWidth: 4,
    borderColor: colors.white,
    boxShadow: '0 2px 6px rgba(0,0,0,.3)',
  },
  maneuver: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.ink,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,.35)',
  },
  column: {
    alignItems: 'center',
  },
  destinationHead: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.white,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,.3)',
  },
  pointer: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  destinationPointer: {
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    marginTop: -2,
  },
  origin: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: colors.white,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,.3)',
  },
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
  stop: {
    width: 40,
    height: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metroStop: {
    borderRadius: 20,
    borderColor: colors.white,
  },
  vehicleStop: {
    borderRadius: 8,
    borderWidth: 4,
    backgroundColor: colors.white,
  },
});
