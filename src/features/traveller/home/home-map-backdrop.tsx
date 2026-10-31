import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, G, Pattern, Rect } from 'react-native-svg';

import { colors } from '@/ui/theme';

// Decorative city drawn behind the home trail (mockup v7, E01-E05 and E27): streets,
// two parks, water and a diagonal avenue. It carries no information.

const WIDTH = 360;
const HEIGHT = 800;

function streets() {
  const strips = [];
  for (let x = 28 - 92; x < WIDTH; x += 92) {
    strips.push(
      <Rect key={`v${x}`} x={x} y={0} width={12} height={HEIGHT} fill={colors.mapStreet} />,
    );
  }
  for (let y = 20 - 80; y < HEIGHT; y += 80) {
    strips.push(
      <Rect key={`h${y}`} x={0} y={y} width={WIDTH} height={12} fill={colors.mapStreet} />,
    );
  }
  return strips;
}

function Park({
  x,
  y,
  width,
  height,
  radius,
}: Record<'x' | 'y' | 'width' | 'height' | 'radius', number>) {
  const shape = { x, y, width, height, rx: radius, ry: radius };
  return (
    <G>
      <Rect {...shape} fill={colors.mapPark} />
      <Rect {...shape} fill="url(#trees)" />
    </G>
  );
}

export function HomeMapBackdrop() {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <Pattern id="trees" width={24} height={24} patternUnits="userSpaceOnUse">
          <Circle cx={12} cy={12} r={6} fill={colors.mapParkDot} />
        </Pattern>
      </Defs>
      <Rect width={WIDTH} height={HEIGHT} fill={colors.mapGroundHome} />
      {streets()}
      <Park x={-30} y={300} width={150} height={190} radius={46} />
      <Park x={190} y={650} width={220} height={200} radius={100} />
      <Rect x={260} y={70} width={190} height={290} rx={95} ry={120} fill={colors.mapWater} />
      <Rect
        x={-80}
        y={470}
        width={560}
        height={20}
        fill={colors.mapStreet}
        stroke={colors.mapStreetEdge}
        strokeWidth={1}
        transform="rotate(-24 200 480)"
      />
      <Rect width={WIDTH} height={HEIGHT} fill={colors.mapVeil} />
    </Svg>
  );
}
