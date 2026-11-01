import { Pressable, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/ui/icon/icon';
import { colors, radii, sizes } from '@/ui/theme';

type MainActionButtonProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

/** The full-width blue bar that moves the traveller forward: continue, confirm, start. */
export function MainActionButton({
  icon,
  label,
  onPress,
  disabled = false,
}: MainActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.bar, disabled && styles.disabled, pressed && styles.pressed]}
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
    boxShadow: '0 2px 8px rgba(30,107,255,.35)',
  },
  disabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.85,
  },
});
