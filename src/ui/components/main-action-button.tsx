import { Pressable, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/ui/icon/icon';
import { colors, shadows, sizes } from '@/ui/theme';

type MainActionButtonProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

/**
 * The blue pill that moves the traveller forward: continue, confirm, start (spec 008).
 * Full width of its parent, 64 dp high, rounded ends and a blue glow.
 */
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
      style={({ pressed }) => [styles.pill, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Icon name={icon} size={34} color={colors.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: sizes.minTarget,
    borderRadius: sizes.minTarget / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.accent,
  },
  disabled: {
    opacity: 0.35,
    boxShadow: 'none',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
