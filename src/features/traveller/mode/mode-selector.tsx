import { Pressable, StyleSheet, View } from 'react-native';

import type { TravelMode } from '@/domain/trip';
import { Icon, type IconName } from '@/ui/icon/icon';
import { colors, radii, shadows } from '@/ui/theme';

const MODES: { mode: TravelMode; icon: IconName; label: string }[] = [
  { mode: 'walk', icon: 'directions_walk', label: 'À pied' },
  { mode: 'transit', icon: 'directions_bus', label: 'Transports en commun' },
  { mode: 'car', icon: 'directions_car', label: 'Voiture' },
];

type ModeSelectorProps = {
  selected: TravelMode;
  onSelect: (mode: TravelMode) => void;
};

/** Three unambiguous choices: on foot, public transport, car (docs/screens.md, rule 6). */
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
            style={[styles.segment, on && styles.on]}
          >
            {/* The blue background alone shows the chosen mode. */}
            <Icon name={icon} size={32} color={on ? colors.white : colors.ink} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: 76,
    padding: 6,
    gap: 6,
    borderRadius: radii.control + 4,
    backgroundColor: colors.surfaceLow,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: radii.control,
  },
  on: {
    backgroundColor: colors.primary,
    boxShadow: shadows.accent,
  },
});
