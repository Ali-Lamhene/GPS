import { Pressable, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/ui/icon/icon';
import { colors, sizes } from '@/ui/theme';

type MainActionButtonProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Disc floating over a page (mockup v7), or full-width bar inside a sheet (spec 002). */
  shape?: 'disc' | 'bar';
};

/** The blue disc that moves the traveller forward: continue, confirm, start. */
export function MainActionButton({
  icon,
  label,
  onPress,
  disabled = false,
  shape = 'disc',
}: MainActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        shape === 'disc' ? styles.disc : styles.bar,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Icon name={icon} size={shape === 'disc' ? 48 : 36} color={colors.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disc: {
    width: sizes.mainAction,
    height: sizes.mainAction,
    borderRadius: sizes.mainAction / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 0 8px ${colors.primaryHalo}, 0 2px 8px rgba(0,0,0,.18)`,
  },
  bar: {
    height: sizes.minTarget,
    borderRadius: sizes.minTarget / 2,
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
