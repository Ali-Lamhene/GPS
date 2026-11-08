import { I18nManager, StyleSheet, View } from 'react-native';

import { colors } from '@/ui/theme';

/** Dots of the progress line, as in the emerald mockups (spec 010). */
export const PROGRESS_DOTS = 12;

/** How many dots stand for the way already done, for a progress from 0 to 1. */
export function doneDots(progress: number, count = PROGRESS_DOTS): number {
  return Math.round(Math.min(1, Math.max(0, progress)) * count);
}

type ProgressStripProps = {
  /** From 0 to 1 along the whole trip. */
  progress: number;
};

/**
 * The way between the start pin and the flag (spec 010): emerald dots for what is done,
 * pale dots for what is left. Read by colour, not by position, so it holds in both
 * reading directions (spec 006).
 */
export function ProgressStrip({ progress }: ProgressStripProps) {
  const done = doneDots(progress);
  return (
    // Never mirrored: done dots always start from the pin (spec 006).
    <View style={[styles.dots, I18nManager.isRTL && styles.unmirrored]} testID="progress-dots">
      {Array.from({ length: PROGRESS_DOTS }, (_, i) => (
        <View
          key={i}
          testID={i < done ? 'dot-done' : 'dot-left'}
          style={[styles.dot, i < done ? styles.done : styles.left]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unmirrored: {
    flexDirection: 'row-reverse',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // Larger as well as darker: the way done reads at a glance, even in the sun (spec 027).
  done: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.emerald,
  },
  left: {
    backgroundColor: colors.surfaceHighest,
  },
});
