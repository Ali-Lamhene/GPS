import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

import type { GuidanceVisual } from '@/domain/guidance';
import { Icon, type IconName } from '@/ui/icon/icon';
import { colors, shadows } from '@/ui/theme';

// Drawn street map of the walking steps (mockup v7, E09-E11, E17), in a 336 × 388 frame
// scaled to cover the pane. It stands in for the real map of spec 003 (D6).

const WIDTH = 336;
const HEIGHT = 388;

type Box = [x: number, y: number, width: number, height: number];
type Route = Extract<GuidanceVisual, { kind: 'map' }>['route'];

const ROUTES: Record<Route, { segments: Box[]; marker: [number, number] }> = {
  straight: { segments: [[163, 60, 10, 340]], marker: [136, 8] },
  left: {
    segments: [
      [163, 145, 10, 260],
      [0, 145, 173, 10],
    ],
    marker: [136, 8],
  },
  right: {
    segments: [
      [163, 145, 10, 260],
      [163, 145, 173, 10],
    ],
    marker: [136, 8],
  },
  arrive: {
    segments: [
      [163, 145, 10, 260],
      [163, 145, 100, 10],
    ],
    marker: [240, 118],
  },
};

function streets() {
  const strips = [];
  for (let x = 159 - 112 * 2; x < WIDTH; x += 112) {
    strips.push(
      <Rect key={`v${x}`} x={x} y={0} width={18} height={HEIGHT} fill={colors.mapStreet} />,
    );
  }
  for (let y = 141 - 112 * 2; y < HEIGHT; y += 112) {
    strips.push(
      <Rect key={`h${y}`} x={0} y={y} width={WIDTH} height={18} fill={colors.mapStreet} />,
    );
  }
  return strips;
}

type GuidanceMapProps = {
  route: Route;
  markerIcon?: IconName;
};

export function GuidanceMap({ route, markerIcon }: GuidanceMapProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { segments, marker } = ROUTES[route];

  // Same "slice" fit as the SVG, to pin the marker on the drawing.
  const scale = Math.max(size.width / WIDTH, size.height / HEIGHT);
  const offsetX = (size.width - WIDTH * scale) / 2;
  const offsetY = (size.height - HEIGHT * scale) / 2;

  return (
    <View style={StyleSheet.absoluteFill} onLayout={(event) => setSize(event.nativeEvent.layout)}>
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <Rect width={WIDTH} height={HEIGHT} fill={colors.mapGround} />
        {streets()}
        {segments.map(([x, y, width, height], i) => (
          <Rect
            key={i}
            x={x}
            y={y}
            width={width}
            height={height}
            rx={5}
            fill={colors.route}
            stroke={colors.white}
            strokeWidth={2}
          />
        ))}
        <Circle cx={168} cy={286} r={20} fill={colors.routeHalo} />
        <Circle
          cx={168}
          cy={286}
          r={10}
          fill={colors.route}
          stroke={colors.white}
          strokeWidth={4}
        />
      </Svg>
      {markerIcon && size.width > 0 && (
        <View
          style={[
            styles.marker,
            {
              left: offsetX + marker[0] * scale,
              top: offsetY + marker[1] * scale,
            },
          ]}
        >
          <Icon name={markerIcon} size={36} color={colors.white} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.medium,
  },
});
