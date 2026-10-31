import { Pressable, StyleSheet, View } from 'react-native';

import type { TravelMode } from '@/domain/trip';
import { Icon, type IconName } from '@/ui/icon/icon';
import { colors } from '@/ui/theme';

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
            {on && <Icon name="check" size={22} color={colors.white} variant="outlined" />}
            <Icon name={icon} size={34} color={on ? colors.white : colors.ink} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: 64,
    padding: 4,
    gap: 4,
    borderRadius: 32,
    backgroundColor: colors.surfaceHigh,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 28,
  },
  on: {
    backgroundColor: colors.primary,
    boxShadow: '0 2px 6px rgba(30,107,255,.35)',
  },
});
