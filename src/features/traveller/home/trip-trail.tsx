import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/ui/theme';

/** Centres of the start and end tiles, as fractions of the screen (mockup v7, 360 × 800). */
export const TRAIL_START = { x: 110 / 360, y: 190 / 800 };
export const TRAIL_END = { x: 250 / 360, y: 590 / 800 };

/** S-shaped curve from the start tile down to the end tile. */
export function trailPath(width: number, height: number): string {
  const x1 = TRAIL_START.x * width;
  const y1 = TRAIL_START.y * height;
  const x2 = TRAIL_END.x * width;
  const y2 = TRAIL_END.y * height;
  const c1 = (400 / 800) * height;
  const c2 = (370 / 800) * height;
  return `M ${x1} ${y1} C ${x1} ${c1}, ${x2} ${c2}, ${x2} ${y2}`;
}

type TripTrailProps = {
  width: number;
  height: number;
  /** Dotted grey before any choice, dotted black once the start is chosen, solid blue when ready. */
  stage: 'empty' | 'started' | 'ready';
};

const STROKE = {
  empty: colors.inkDisabled,
  started: colors.ink,
  ready: colors.primary,
} as const;

export function TripTrail({ width, height, stage }: TripTrailProps) {
  const d = trailPath(width, height);
  return (
    <Svg style={StyleSheet.absoluteFill} width={width} height={height} pointerEvents="none">
      <Path d={d} fill="none" stroke={colors.white} strokeWidth={14} strokeLinecap="round" />
      <Path
        d={d}
        fill="none"
        stroke={STROKE[stage]}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={stage === 'ready' ? undefined : [0.1, 14]}
      />
    </Svg>
  );
}
