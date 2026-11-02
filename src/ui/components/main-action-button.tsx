import { Pressable, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/ui/icon/icon';
import { colors, radii, sizes } from '@/ui/theme';

type MainActionButtonProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Rounded ends: the floating home card (spec 007). */
  shape?: 'bar' | 'pill';
};

/** The full-width blue bar that moves the traveller forward: continue, confirm, start. */
export function MainActionButton({
  icon,
  label,
  onPress,
  disabled = false,
  shape = 'bar',
}: MainActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.bar,
        shape === 'pill' && styles.pill,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Icon name={icon} size={32} color={colors.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: sizes.minTarget,
    borderRadius: radii.control,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(47,107,255,.35)',
  },
  pill: {
    borderRadius: sizes.minTarget / 2,
  },
  disabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.85,
  },
});
