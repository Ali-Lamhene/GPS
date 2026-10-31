import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/ui/theme';

/** SVG path of the filled slice, clockwise from 12 o'clock, in a circle of radius r. */
export function slicePath(fill: number, r: number): string {
  const angle = Math.min(1, Math.max(0, fill)) * 2 * Math.PI;
  const x = r + r * Math.sin(angle);
  const y = r - r * Math.cos(angle);
  const largeArc = angle > Math.PI ? 1 : 0;
  return `M ${r} ${r} L ${r} 0 A ${r} ${r} 0 ${largeArc} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`;
}

type TimeDialProps = {
  /** From 0 (empty) to 1 (one full hour). */
  fill: number;
  size: number;
  /** Colour of the cross that splits the dial into quarters: the background behind it. */
  crossColor: string;
};

/** One hour dial split into four quarters, filled in proportion to the time. */
export function TimeDial({ fill, size, crossColor }: TimeDialProps) {
  const r = size / 2;
  const cross = size >= 100 ? 4 : size >= 50 ? 3 : 2;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={r} cy={r} r={r} fill={colors.surfaceHighest} />
        {fill >= 1 ? (
          <Circle cx={r} cy={r} r={r} fill={colors.primary} />
        ) : fill > 0 ? (
          <Path d={slicePath(fill, r)} fill={colors.primary} />
        ) : null}
        <Rect x={r - cross / 2} y={0} width={cross} height={size} fill={crossColor} />
        <Rect x={0} y={r - cross / 2} width={size} height={cross} fill={crossColor} />
      </Svg>
    </View>
  );
}
