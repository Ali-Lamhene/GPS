import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { colors, fontFamilies } from '@/ui/theme';

import { GLYPHS, type IconName } from './glyphs';

export type { IconName } from './glyphs';

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  /** Material Symbols "FILL" axis: filled shapes by default, outlined for chrome icons. */
  variant?: 'filled' | 'outlined';
  style?: StyleProp<TextStyle>;
};

/** A Material Symbols Rounded pictogram, drawn from the bundled icon font. */
export function Icon({
  name,
  size = 24,
  color = colors.ink,
  variant = 'filled',
  style,
}: IconProps) {
  return (
    <Text
      accessible={false}
      aria-hidden
      allowFontScaling={false}
      style={[
        styles.glyph,
        {
          fontFamily: variant === 'filled' ? fontFamilies.iconFilled : fontFamilies.icon,
          fontSize: size,
          lineHeight: size,
          width: size,
          height: size,
          color,
        },
        style,
      ]}
    >
      {String.fromCodePoint(GLYPHS[name])}
    </Text>
  );
}

const styles = StyleSheet.create({
  glyph: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});
