import { Pressable, StyleSheet, View } from 'react-native';

import { CURRENT_POSITION, isHiddenOnMap, type Place } from '@/domain/place';
import { PlaceFace } from '@/ui/components/place-face';

import { hereIcon, type HereUnavailable } from './here-state';
import { colors, shadows } from '@/ui/theme';

const TILE_MIN = 56;
const TILE_MAX = 64;
const GAP_MIN = 8;
const GAP_MAX = 14;
/** Share of the last tile left visible by the edge: enough to see a place, cut enough to invite a swipe. */
const CUT_MIN = 0.4;
const CUT_MAX = 0.65;
/** Corners of the small home tiles (spec 012). */
export const TILE_RADIUS = 16;
/** White disc of the pictogram over a photo: keeps a 16 dp pictogram, the second channel (spec 012). */
const BADGE_SIZE = 26;

export type TileLayout = { size: number; gap: number };

/**
 * Share of the last tile still visible when the rail starts at its first tile; 1 when the edge
 * falls in a gap, every visible tile being whole.
 */
export function lastTileShown(visibleWidth: number, { size, gap }: TileLayout): number {
  return Math.min(visibleWidth % (size + gap), size) / size;
}

/**
 * Size and gap of the square place tiles (spec 012): the largest tile from 56 to 64 dp, with a
 * gap from 8 to 14 dp, such that the edge cuts the last visible tile between 40 % and 65 %, so it
 * always invites to swipe. `visibleWidth` runs from the first tile to the edge of the panel.
 */
export function tileLayout(visibleWidth: number): TileLayout {
  for (let size = TILE_MAX; size >= TILE_MIN; size -= 1) {
    let best: TileLayout | undefined;
    let bestDistance = Infinity;
    for (let gap = GAP_MIN; gap <= GAP_MAX; gap += 1) {
      const shown = lastTileShown(visibleWidth, { size, gap });
      const distance = Math.abs(shown - 0.5);
      if (shown >= CUT_MIN && shown <= CUT_MAX && distance < bestDistance) {
        best = { size, gap };
        bestDistance = distance;
      }
    }
    if (best) return best;
  }
  return { size: TILE_MIN, gap: GAP_MIN };
}

type PlaceTileProps = {
  place: Place;
  size: number;
  /** The place already chosen for the end that calls: ringed in emerald. */
  selected: boolean;
  /** « Here » without a usable position (spec 017): greyed, crossed out when unavailable. */
  unavailable?: HereUnavailable;
  onPress: () => void;
};

/**
 * A place in the home panel (spec 009): its photo with the pictogram in a small white disc,
 * or its emerald outlined pictogram on warm white. A place kept off the map (home, family)
 * never shows its photo here: the home is seen as soon as the app opens.
 */
export function PlaceTile({ place, size, selected, unavailable, onPress }: PlaceTileProps) {
  const here = place.id === CURRENT_POSITION.id;
  const shown: Place = here
    ? { ...place, icon: hereIcon(unavailable, 'person_pin_circle') }
    : place;
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
          badgeSize={BADGE_SIZE}
          muted={here && unavailable !== undefined}
        />
      </View>
      {selected && <View pointerEvents="none" style={styles.ring} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: TILE_RADIUS,
    boxShadow: shadows.warm,
  },
  clip: {
    ...StyleSheet.absoluteFill,
    borderRadius: TILE_RADIUS,
    borderWidth: 1,
    borderColor: colors.warmEdge,
    overflow: 'hidden',
  },
  ring: {
    ...StyleSheet.absoluteFill,
    borderRadius: TILE_RADIUS,
    borderWidth: 3,
    borderColor: colors.emerald,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
});
