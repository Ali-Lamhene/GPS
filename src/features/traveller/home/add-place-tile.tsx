import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/ui/icon/icon';
import { colors, radii } from '@/ui/theme';

type AddPlaceTileProps = {
  size: number;
  onPress: () => void;
};

/** Saves the current position as a new place (E27). */
export function AddPlaceTile({ size, onPress }: AddPlaceTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Enregistrer ma position"
      onPress={onPress}
      style={[styles.tile, { width: size, height: size }]}
    >
      <Icon name="add_location_alt" size={36} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radii.control,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
