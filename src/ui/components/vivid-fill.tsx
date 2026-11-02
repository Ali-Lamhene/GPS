import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { categoryOfIcon } from '@/domain/place-category';
import { colors } from '@/ui/theme';

type VividFillProps = {
  /** Pictogram whose family gives the colour; any other pictogram gets « other ». */
  icon: string;
};

/**
 * Fills its parent with the vivid gradient of a family of places (spec 008), bright at the
 * top left, deep at the bottom right. The parent sets the shape and clips it.
 */
export function VividFill({ icon }: VividFillProps) {
  const family = categoryOfIcon(icon);
  const [from, to] = colors.vivid[family];
  const id = `vivid-${family}`;
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={from} />
          <Stop offset="1" stopColor={to} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
