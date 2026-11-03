import { Pressable, StyleSheet, View } from 'react-native';

import { CURRENT_POSITION, isHiddenOnMap, type Place } from '@/domain/place';
import { PlaceFace } from '@/ui/components/place-face';
import { colors, radii, shadows } from '@/ui/theme';

const TILE_MIN = 96;
const TILE_MAX = 120;
/** How many tiles show across the panel: the last one is always cut by the edge. */
const TILES_SHOWN = 2.75;

/**
 * Side of the square place tiles (spec 011): about two and three quarters fit across the panel, so the
 * cut one invites to swipe, within 96 to 120 dp.
 */
export function tileSize(railWidth: number, gap: number, padding: number): number {
  const fit = (railWidth - padding - 2 * gap) / TILES_SHOWN;
  return Math.round(Math.min(TILE_MAX, Math.max(TILE_MIN, fit)));
}

type PlaceTileProps = {
  place: Place;
  size: number;
  /** The place already chosen for the end that calls: ringed in emerald. */
  selected: boolean;
  onPress: () => void;
};

/**
 * A place in the home panel (spec 009): its photo with the pictogram in a small white disc,
 * or its emerald outlined pictogram on warm white. A place kept off the map (home, family)
 * never shows its photo here: the home is seen as soon as the app opens.
 */
export function PlaceTile({ place, size, selected, onPress }: PlaceTileProps) {
  const shown: Place = place.id === CURRENT_POSITION.id ? { ...place, icon: 'my_location' } : place;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={place.helpName ?? 'Lieu'}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { width: size, height: size },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.clip}>
        <PlaceFace
          place={shown}
          iconSize={Math.round(size * 0.45)}
          showPhoto={!isHiddenOnMap(place)}
          badgeSize={30}
        />
      </View>
      {selected && <View pointerEvents="none" style={styles.ring} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radii.tile,
    boxShadow: shadows.warm,
  },
  clip: {
    ...StyleSheet.absoluteFill,
    borderRadius: radii.tile,
    borderWidth: 1,
    borderColor: colors.warmEdge,
    overflow: 'hidden',
  },
  ring: {
    ...StyleSheet.absoluteFill,
    borderRadius: radii.tile,
    borderWidth: 3,
    borderColor: colors.emerald,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
});
