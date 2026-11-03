import { Pressable, StyleSheet } from 'react-native';

import type { Place } from '@/domain/place';
import { PlaceFace } from '@/ui/components/place-face';
import { colors, radii } from '@/ui/theme';

type SheetPlaceTileProps = {
  place: Place;
  size: number;
  onPress: () => void;
  disabled?: boolean;
};

/** A saved place in the place sheet: its emerald pictogram, or its photo (spec 009). */
export function SheetPlaceTile({ place, size, onPress, disabled = false }: SheetPlaceTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={place.helpName ?? 'Lieu'}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { width: size, height: size },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {/* The sheet may show it: the place is being chosen (spec 005). */}
      <PlaceFace place={place} iconSize={Math.round(size * 0.42)} badgeSize={28} showPhoto />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radii.tile,
    borderWidth: 1,
    borderColor: colors.warmEdge,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.3,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
});
