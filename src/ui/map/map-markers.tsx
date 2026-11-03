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

// Markers drawn over the phone's map, the same as the browser ones (map-markers.web.ts).

function deepColor(icon: IconName): string {
  return colors.category[categoryOfIcon(icon)];
}

/** The traveller: a large blue dot with a white ring and a dark outline. */
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
            <Stop offset="0" stopColor={colors.primary} stopOpacity={0.6} />
            <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
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
 * A saved place the traveller can touch (specs 005, 008): a disc of its family colour with
 * its white pictogram, or its photo edged in that colour with the pictogram in the
 * bottom-left corner, and a pointer to the exact spot. The chosen one is larger, ringed in
 * blue.
 */
export function PlacePin({ icon, photo, selected }: PlacePinProps) {
  const size = selected ? 62 : 50;
  const deep = deepColor(icon);
  const picture = photo !== undefined && isLocalPicture(photo) ? photo : undefined;
  return (
    <View style={styles.column}>
      <View>
        <View
          style={[
            styles.placeHead,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: picture ? deep : colors.white,
              boxShadow: selected
                ? `0 0 0 4px ${colors.primary}, 0 4px 12px rgba(17,24,39,.35)`
                : '0 3px 10px rgba(17,24,39,.3)',
            },
          ]}
        >
          <VividFill icon={icon} />
          {picture ? (
            <Image source={{ uri: picture }} contentFit="cover" style={StyleSheet.absoluteFill} />
          ) : (
            <Icon name={icon} size={selected ? 32 : 26} color={colors.white} />
          )}
        </View>
        {picture && (
          <View style={styles.placeBadge}>
            <Icon name={icon} size={17} color={deep} />
          </View>
        )}
      </View>
      <View
        style={[
          styles.pointer,
          styles.placePointer,
          { borderTopColor: selected ? colors.primary : deep },
        ]}
      />
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotHalo: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accuracy,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    borderWidth: 5,
    borderColor: colors.white,
    boxShadow: `0 0 0 2px ${colors.onSecondaryContainer}, 0 2px 6px rgba(0,0,0,.35)`,
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
  placePointer: {
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    marginTop: -1,
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
  placeHead: {
    borderWidth: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeBadge: {
    position: 'absolute',
    left: -4,
    bottom: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,.3)',
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
