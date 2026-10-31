import { StyleSheet, Text, View } from 'react-native';

import type { TransitLine } from '@/domain/trip';
import { colors, fontFamilies } from '@/ui/theme';

// Decision D9: official line ids are one of the three texts the traveller sees, so they
// can match the screen with the signs of the network.

const SIZES = {
  sm: { height: 28, minWidth: 40, paddingHorizontal: 8, fontSize: 15 },
  md: { height: 36, minWidth: 52, paddingHorizontal: 10, fontSize: 19 },
  lg: { height: 48, minWidth: 48, paddingHorizontal: 12, fontSize: 24 },
  xl: { height: 52, minWidth: 80, paddingHorizontal: 14, fontSize: 30 },
  banner: { height: 52, minWidth: 52, paddingHorizontal: 16, fontSize: 28 },
} as const;

type LineBadgeProps = {
  line: TransitLine;
  size: keyof typeof SIZES;
};

/** The line id in the network colours, as on the signs: "C3", "M1". */
export function LineBadge({ line, size }: LineBadgeProps) {
  const { fontSize, ...box } = SIZES[size];
  return (
    <View
      accessibilityLabel={`Ligne ${line.id}`}
      style={[
        styles.badge,
        box,
        {
          backgroundColor: line.color,
          borderRadius: line.shape === 'pill' ? box.height / 2 : 12,
        },
      ]}
    >
      {/* Fixed like a network sign: the system font size must not crop the id. */}
      <Text
        maxFontSizeMultiplier={1}
        style={[styles.text, { fontSize, color: line.textColor ?? colors.white }]}
      >
        {line.id}
      </Text>
    </View>
  );
}

type MetroSignProps = {
  color: string;
  size: number;
};

/** The round "M" of metro entrances. */
export function MetroSign({ color, size }: MetroSignProps) {
  return (
    <View
      accessibilityLabel="Métro"
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    >
      <Text maxFontSizeMultiplier={1} style={[styles.text, { fontSize: Math.round(size * 0.6) }]}>
        M
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontFamily: fontFamilies.bold,
  },
});
