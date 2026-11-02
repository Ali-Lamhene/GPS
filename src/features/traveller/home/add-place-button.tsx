import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Icon } from '@/ui/icon/icon';
import { colors, shadows, sizes } from '@/ui/theme';

import { useHoldProgress } from '../hooks/use-hold-progress';

const HOLD_MS = 3000;
/** The ring stays hidden this long: a brief touch shows nothing to wonder about. */
const HIDDEN_SHARE = 1 / 3;
/**
 * Released before the ring shows, a press is a tap: a slow or shaky finger still opens
 * E27 instead of nothing.
 */
const TAP_MAX_MS = 1000;
const SIZE = sizes.minTarget;
const RING = 4;
const OUTER = SIZE + 4 * RING;
const RADIUS = (OUTER - RING) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type AddPlaceButtonProps = {
  /** A tap: the traveller keeps the place where they stand (E27-E29). */
  onAddHere: () => void;
  /** A 3 second hold: the companion types an address (E30). */
  onAddAddress: () => void;
};

/**
 * Round blue « + » floating at the bottom right of the home, above the cards (specs 007,
 * 008). A tap starts the traveller's new
 * place; a 3 second hold opens the companion's address form, with a ring that only shows
 * after the first second. Nothing on screen tells about the hold: no text for the
 * traveller to stumble on.
 */
export function AddPlaceButton({ onAddHere, onAddAddress }: AddPlaceButtonProps) {
  const { progress, start, cancel } = useHoldProgress(HOLD_MS, onAddAddress);
  const shown = Math.max(0, (progress - HIDDEN_SHARE) / (1 - HIDDEN_SHARE));
  return (
    <View style={styles.frame}>
      {shown > 0 && (
        <Svg style={styles.ring} width={OUTER} height={OUTER} pointerEvents="none">
          <Circle
            cx={OUTER / 2}
            cy={OUTER / 2}
            r={RADIUS}
            fill="none"
            // Grey, not the blue of « continue »: nothing invites to keep pressing.
            stroke={colors.inkMuted}
            strokeWidth={RING}
            strokeLinecap="round"
            strokeDasharray={[shown * CIRCUMFERENCE, CIRCUMFERENCE]}
            // Starts at the top and runs clockwise.
            transform={`rotate(-90 ${OUTER / 2} ${OUTER / 2})`}
          />
        </Svg>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ajouter un lieu"
        hitSlop={(sizes.minTarget - SIZE) / 2}
        onPress={onAddHere}
        // A long press swallows the tap, so a released hold never opens E27.
        onLongPress={() => undefined}
        delayLongPress={TAP_MAX_MS}
        onPressIn={start}
        onPressOut={cancel}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Icon name="add" size={36} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    top: (SIZE - OUTER) / 2,
    left: (SIZE - OUTER) / 2,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.accent,
  },
  pressed: {
    opacity: 0.8,
  },
});
