import { Pressable, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/ui/icon/icon';
import { colors, shadows, sizes } from '@/ui/theme';

type MainActionButtonProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Emerald everywhere since spec 010; kept for the home's call sites. */
  tone?: 'primary' | 'emerald';
};

/**
 * The emerald pill that moves the traveller forward: continue, confirm, start (spec 010).
 * Full width of its parent, 56 dp high, rounded ends and an emerald glow.
 */
export function MainActionButton({
  icon,
  label,
  onPress,
  disabled = false,
  tone = 'primary',
}: MainActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        tone === 'emerald' && styles.emerald,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Icon name={icon} size={30} color={colors.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: sizes.actionPill,
    borderRadius: sizes.actionPill / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.accent,
  },
  emerald: {
    backgroundColor: colors.emerald,
    boxShadow: shadows.emerald,
  },
  disabled: {
    opacity: 0.35,
    boxShadow: 'none',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
