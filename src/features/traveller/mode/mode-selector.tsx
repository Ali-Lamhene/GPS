import { Pressable, StyleSheet, View } from 'react-native';

import type { TravelMode } from '@/domain/trip';
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
};

/**
 * Three unambiguous choices: on foot, public transport, car (docs/screens.md, rule 6), as
 * round buttons (spec 010): the chosen one solid emerald, the others pale.
 */
export function ModeSelector({ selected, onSelect }: ModeSelectorProps) {
  return (
    <View style={styles.bar} accessibilityRole="radiogroup">
      {MODES.map(({ mode, icon, label }) => {
        const on = mode === selected;
        return (
          <Pressable
            key={mode}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ checked: on }}
            onPress={() => onSelect(mode)}
            style={[styles.choice, on && styles.on]}
          >
            <Icon
              name={icon}
              size={32}
              color={on ? colors.white : colors.emerald}
              variant={on ? 'filled' : 'outlined'}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
