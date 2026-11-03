import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { PlacePin } from '@/ui/components/place-pin';
import { Icon } from '@/ui/icon/icon';
import type { IconName } from '@/ui/icon/glyphs';
import { colors } from '@/ui/theme';

import { MapMetroLetter } from './map-texts';
import { PIN_BOX, PIN_PATH, pinFace } from './pin-shape';

export { PlacePin };

// Markers drawn over the phone's map, the same as the browser ones (map-markers.web.ts).

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

/** Emerald arrow on a white disc at the next corner, unlike the traveller's dot (spec 010). */
export function ManeuverArrow({ rotation }: { rotation: number }) {
  return (
    <View
      pointerEvents="none"
      style={[styles.maneuver, { transform: [{ rotate: `${rotation}deg` }] }]}
    >
      <Icon name="arrow_upward" size={32} color={colors.emerald} />
    </View>
  );
}

/** Destination: the chosen place's solid emerald teardrop (spec 010). */
export function DestinationPin({ icon }: { icon: IconName }) {
  return (
    <View pointerEvents="none">
      <PlacePin icon={icon} photo={undefined} selected />
    </View>
  );
}

/** Start of the trip when it is a saved place: a white teardrop edged in emerald. */
export function OriginPin({ icon }: { icon: IconName }) {
  return (
    <View pointerEvents="none">
      <PlacePin icon={icon} photo={undefined} selected={false} />
    </View>
  );
}

type StopPinProps = {
  symbol: IconName | 'metro';
  color: string;
  alight: boolean;
};

/**
 * Stop where to get on or off (spec 010): a teardrop like the place pins, white edged in
 * the line colour with the vehicle pictogram, or solid in the line colour with the metro
 * "M". Where to get off, its head is ringed in the alert orange.
 */
export function StopPin({ symbol, color, alight }: StopPinProps) {
  const width = STOP_WIDTH;
  const face = pinFace(width, false);
  const metro = symbol === 'metro';
  return (
    <View pointerEvents="none" style={{ width, height: face.height }}>
      <Svg
        width={width}
        height={face.height}
        viewBox={`0 0 ${PIN_BOX.width} ${PIN_BOX.height}`}
        style={StyleSheet.absoluteFill}
      >
        <Path
          d={PIN_PATH}
          fill={metro ? color : colors.white}
          stroke={alight ? colors.alert : color}
          strokeWidth={alight ? 4 : 2.5}
        />
      </Svg>
      <View
        style={[
          styles.stopFace,
          { left: face.left, top: face.top, width: face.size, height: face.size },
        ]}
      >
        {metro ? (
          <MapMetroLetter />
        ) : (
          <Icon
            name={symbol}
            size={Math.round(face.size * 0.7)}
            color={colors.ink}
            variant="outlined"
          />
        )}
      </View>
    </View>
  );
}

/** Stop pins are a little smaller than place pins: the places stay the main marks. */
const STOP_WIDTH = 36;

const styles = StyleSheet.create({
  stopFace: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    backgroundColor: colors.white,
    borderWidth: 4,
    borderColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,.35)',
  },
});
