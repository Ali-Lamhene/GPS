import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/ui/icon/icon';
import { colors, shadows, spacing } from '@/ui/theme';

/** The size of the emerald mockup, without a larger touch area (D15). */
export const ADD_BUTTON_SIZE = 48;
/** The companion's button stays small beside the « + »: the traveller's action comes first. */
const COMPANION_SIZE = 36;

type AddPlaceButtonProps = {
  /** A tap on « + »: the traveller keeps the place where they stand (E27-E29). */
  onAddHere: () => void;
  /** A tap on the small two-people button: the companion types an address (E30). */
  onAddAddress: () => void;
};

/**
 * Bottom right of the home (spec 011): the round emerald « + » to keep the place where the
 * traveller stands, and, beside it, a small warm-white button with two people that
 * opens the companion's address form. No hidden hold any more.
 */
export function AddPlaceButton({ onAddHere, onAddAddress }: AddPlaceButtonProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ajouter une adresse (accompagnant)"
        onPress={onAddAddress}
        style={({ pressed }) => [styles.companion, pressed && styles.pressed]}
      >
        <Icon name="supervisor_account" size={22} color={colors.emerald} variant="outlined" />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ajouter un lieu"
        onPress={onAddHere}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Icon name="add" size={30} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  companion: {
    width: COMPANION_SIZE,
    height: COMPANION_SIZE,
    borderRadius: COMPANION_SIZE / 2,
    backgroundColor: colors.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.warm,
  },
  button: {
    width: ADD_BUTTON_SIZE,
    height: ADD_BUTTON_SIZE,
    borderRadius: ADD_BUTTON_SIZE / 2,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.emerald,
  },
  pressed: {
    opacity: 0.8,
  },
});
