import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/ui/icon/icon';
import { colors } from '@/ui/theme';

import { hereIcon, type HereUnavailable } from './here-state';

type AddPlaceTileProps = {
  size: number;
  /** Corner radius, the one of the tiles around it. */
  radius: number;
  /** No usable position (spec 017): greyed, crossed out when unavailable; a touch asks again. */
  unavailable?: HereUnavailable;
  onPress: () => void;
};

/**
 * The only tile when there is no place to choose yet (spec 015): a dashed emerald « + », the
 * shape of a tile still to fill, which opens « new place here » like the round « + ».
 */
export function AddPlaceTile({ size, radius, unavailable, onPress }: AddPlaceTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ajouter un lieu"
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { width: size, height: size, borderRadius: radius },
        unavailable !== undefined && styles.unavailable,
        pressed && styles.pressed,
      ]}
    >
      <Icon
        name={hereIcon(unavailable, 'add')}
        size={Math.round(size * 0.45)}
        color={unavailable ? colors.outline : colors.emerald}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    // A pale emerald square with a thick dashed edge: seen as a tile to fill, even in sun.
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.emerald,
    backgroundColor: colors.emeraldHalo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailable: {
    borderColor: colors.outline,
    backgroundColor: colors.warmEdge,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
});
