import { Pressable, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/ui/icon/icon';
import { colors, radii, sizes } from '@/ui/theme';

type Tone = 'plain' | 'tonal' | 'raised' | 'help' | 'glass' | 'night' | 'nightAccent' | 'primary';

const TONES: Record<Tone, { background: string; ink: string; shadow?: string }> = {
  plain: { background: 'transparent', ink: colors.ink },
  tonal: { background: colors.tonal, ink: colors.ink },
  raised: { background: colors.white, ink: colors.ink, shadow: '0 2px 8px rgba(0,0,0,.16)' },
  /** Help looks the same everywhere: dark disc, white question mark. */
  help: { background: colors.ink, ink: colors.white, shadow: '0 2px 8px rgba(0,0,0,.25)' },
  glass: { background: colors.blackGlass, ink: colors.white },
  night: { background: colors.night.button, ink: colors.night.buttonInk },
  nightAccent: { background: colors.night.button, ink: colors.night.listen },
  primary: { background: colors.primary, ink: colors.onPrimary },
};

type IconButtonProps = {
  icon: IconName;
  /** Read by screen readers only: the traveller never sees it. */
  label: string;
  onPress: () => void;
  tone?: Tone;
  shape?: 'circle' | 'square';
  size?: number;
  iconSize?: number;
  iconVariant?: 'filled' | 'outlined';
};

/** Round header button (back, close, home, help) or square panel button. */
export function IconButton({
  icon,
  label,
  onPress,
  tone = 'plain',
  shape = 'circle',
  size = sizes.headerButton,
  iconSize = 30,
  iconVariant = 'outlined',
}: IconButtonProps) {
  const { background, ink, shadow } = TONES[tone];
  // Keeps the mockup's drawn size but gives a stressed thumb at least 64 dp to hit.
  const reach = Math.max(0, (sizes.minTarget - size) / 2);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={reach}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: shape === 'circle' ? size / 2 : radii.control,
          backgroundColor: background,
          boxShadow: shadow,
        },
        pressed && styles.pressed,
      ]}
    >
      <Icon name={icon} size={iconSize} color={ink} variant={iconVariant} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
