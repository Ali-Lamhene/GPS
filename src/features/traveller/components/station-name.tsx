import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { colors, fontFamilies } from '@/ui/theme';

// Decision D9: real stop and station names are one of the three texts the traveller
// sees, so they can compare them with the signs. A listen button always goes with them.

const VARIANTS = {
  instruction: { fontSize: 23, lineHeight: 26, fontFamily: fontFamilies.bold },
  direction: { fontSize: 18, lineHeight: 21, fontFamily: fontFamilies.semiBold },
  row: { fontSize: 17, lineHeight: 20, fontFamily: fontFamilies.semiBold },
  large: { fontSize: 29, lineHeight: 31, fontFamily: fontFamilies.bold },
} as const;

type StationNameProps = {
  name: string;
  variant: keyof typeof VARIANTS;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export function StationName({ name, variant, color = colors.ink, style }: StationNameProps) {
  return <Text style={[styles.name, VARIANTS[variant], { color }, style]}>{name}</Text>;
}

const styles = StyleSheet.create({
  name: {
    flexShrink: 1,
  },
});
