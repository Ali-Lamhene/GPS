import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Icon, type IconName } from '@/ui/icon/icon';
import { colors } from '@/ui/theme';

const SIZE = 88;
const STROKE = 7;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

type TurnGaugeProps = {
  turn: IconName;
  /** Share of the approach left before the corner, from 1 (far) to 0 (there). */
  left: number;
};

/**
 * The arrow to take in a green ring that empties as the corner comes closer (spec 008):
 * no digits, the distance is seen at a glance.
 */
export function TurnGauge({ turn, left }: TurnGaugeProps) {
  const share = Math.min(1, Math.max(0, left));
  return (
    <View style={styles.gauge} testID="turn-gauge">
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={colors.whiteGlass}
          strokeWidth={STROKE}
          fill="none"
        />
        {share > 0 && (
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={colors.go}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={[share * CIRCUMFERENCE, CIRCUMFERENCE]}
            // Starts at the top and runs clockwise.
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        )}
      </Svg>
      <Icon name={turn} size={52} color={colors.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  gauge: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
