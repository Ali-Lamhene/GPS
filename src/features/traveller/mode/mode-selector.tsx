import { Pressable, StyleSheet, View } from 'react-native';

import type { TravelMode } from '@/domain/trip';
import { playCue } from '@/services/feedback';
import { Icon, type IconName } from '@/ui/icon/icon';
import { colors, shadows } from '@/ui/theme';

const MODES: { mode: TravelMode; icon: IconName; label: string }[] = [
  { mode: 'walk', icon: 'directions_walk', label: 'À pied' },
  { mode: 'transit', icon: 'directions_bus', label: 'Transports en commun' },
  { mode: 'car', icon: 'directions_car', label: 'Voiture' },
];

const SIZE = 64;

type ModeSelectorProps = {
  selected: TravelMode;
  onSelect: (mode: TravelMode) => void;
  /** Modes without a trip (spec 021): pale and inactive. */
  unavailable?: readonly TravelMode[];
};

/**
 * Three unambiguous choices: on foot, public transport, car (docs/screens.md, rule 6), as
 * round buttons (spec 010): the chosen one solid emerald, the others pale.
 */
export function ModeSelector({ selected, onSelect, unavailable = [] }: ModeSelectorProps) {
  return (
    <View style={styles.bar} accessibilityRole="radiogroup">
      {MODES.map(({ mode, icon, label }) => {
        const on = mode === selected;
        const off = unavailable.includes(mode);
        return (
          <Pressable
            key={mode}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ checked: on, disabled: off }}
            // No trip by this mode: felt and heard, never chosen (spec 021).
            onPress={() => (off ? playCue('unavailable') : onSelect(mode))}
            style={[styles.choice, on && styles.on, off && styles.off]}
          >
            <Icon
              name={icon}
              size={32}
              color={on ? colors.white : colors.emerald}
              variant={on ? 'filled' : 'outlined'}
            />
            {off && (
              // A second shape for « no trip », not only paleness (spec 021).
              <View style={styles.barred} pointerEvents="none">
                <Icon name="block" size={22} color={colors.outline} />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  off: {
    opacity: 0.5,
  },
  barred: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  choice: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  on: {
    backgroundColor: colors.emerald,
    boxShadow: shadows.emerald,
  },
});
