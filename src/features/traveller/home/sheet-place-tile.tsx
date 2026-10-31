import { Pressable, StyleSheet } from 'react-native';

import { CURRENT_POSITION, type Place } from '@/domain/place';
import { PlaceVisual } from '@/ui/components/place-visual';
import { colors } from '@/ui/theme';

type SheetPlaceTileProps = {
  place: Place;
  size: number;
  onPress: () => void;
  disabled?: boolean;
};

/** A saved place in the place sheet. The current position stands out in light blue. */
export function SheetPlaceTile({ place, size, onPress, disabled = false }: SheetPlaceTileProps) {
  const isHere = place.id === CURRENT_POSITION.id;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={place.helpName ?? 'Lieu'}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          backgroundColor: isHere ? colors.tertiaryContainer : colors.surfaceHigh,
        },
        disabled && styles.disabled,
      ]}
    >
      <PlaceVisual
        place={place}
        iconSize={46}
        badgeSize={42}
        color={isHere ? colors.onTertiaryContainer : colors.ink}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.38,
  },
});
