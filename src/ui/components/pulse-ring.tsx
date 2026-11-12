import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/ui/theme';

type PulseRingProps = {
  borderRadius: number;
  color?: string;
  /** How much the ring grows, as a share of its size (help, spec 034: less, near the edge). */
  spread?: number;
  /** How far outside its parent the ring starts, in dp. */
  inset?: number;
};

/**
 * A ring that grows and fades around its parent, to draw the eye to the next move. With
 * « reduce motion » on (often set by Android's battery saver), it stays still and visible:
 * the animation would otherwise jump to its end, where the ring is transparent.
 */
export function PulseRing({
  borderRadius,
  color = colors.primary,
  spread = 0.29,
  inset = 8,
}: PulseRingProps) {
  const progress = useSharedValue(0);
  const still = useReducedMotion();

  useEffect(() => {
    if (still) return;
    progress.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1,
    );
  }, [progress, still]);

  const animatedStyle = useAnimatedStyle(() =>
    still
      ? { opacity: 0.9, transform: [{ scale: 1 }] }
      : {
          opacity: 0.9 * (1 - progress.value),
          transform: [{ scale: 0.96 + spread * progress.value }],
        },
  );

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        {
          top: -inset,
          right: -inset,
          bottom: -inset,
          left: -inset,
          borderRadius: borderRadius + inset,
          borderColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderWidth: 3,
  },
});
