import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/ui/theme';

type PulseRingProps = {
  borderRadius: number;
  color?: string;
};

/** A ring that grows and fades around its parent, to draw the eye to the next move. */
export function PulseRing({ borderRadius, color = colors.primary }: PulseRingProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1,
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.9 * (1 - progress.value),
    transform: [{ scale: 0.96 + 0.29 * progress.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ring, { borderRadius: borderRadius + 8, borderColor: color }, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    top: -8,
    right: -8,
    bottom: -8,
    left: -8,
    borderWidth: 3,
  },
});
