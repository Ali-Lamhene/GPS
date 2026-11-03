import { I18nManager, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { speak } from '@/services/speech';
import { IconButton } from '@/ui/components/icon-button';
import { TimeDials } from '@/ui/components/time-dials';
import { Icon } from '@/ui/icon/icon';
import { colors, shadows, spacing } from '@/ui/theme';

import { ProgressStrip } from './progress-strip';

type ProgressPanelProps = {
  progress: number;
  remainingMinutes: number;
  /** Stop or station name the traveller can listen to at this step (D9). */
  spokenName?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
};

/**
 * Bottom of the guidance (spec 010): a warm-white pill with the start pin and the time
 * left at one end, the flag at the other, the way done in emerald dots between them; the
 * round « listen » button stands above it when the step has a station name.
 */
export function ProgressPanel({
  progress,
  remainingMinutes,
  spokenName,
  onLayout,
}: ProgressPanelProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.panel, { bottom: spacing.gutter + insets.bottom }]}
      onLayout={onLayout}
      pointerEvents="box-none"
    >
      {spokenName && (
        <View style={styles.listen}>
          <IconButton
            icon="volume_up"
            label="Écouter le nom"
            tone="raised"
            onPress={() => void speak(spokenName)}
          />
        </View>
      )}
      {/* Never mirrored, like the map: the ends are known by their symbol (spec 006). */}
      <View style={[styles.pill, I18nManager.isRTL && styles.unmirrored]}>
        <View style={styles.start}>
          <Icon name="location_on" size={24} color={colors.emerald} variant="outlined" />
          <TimeDials minutes={remainingMinutes} size={34} crossColor={colors.white} gap={3} />
        </View>
        <ProgressStrip progress={progress} />
        <Icon name="flag" size={24} color={colors.emerald} variant="outlined" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    gap: spacing.md,
  },
  // Above the pill, outside the measured panel: the map framing and ⓘ never jump when it
  // shows or hides from one step to the next.
  listen: {
    position: 'absolute',
    right: 0,
    bottom: '100%',
    marginBottom: spacing.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 32,
    backgroundColor: colors.warmWhite,
    boxShadow: shadows.warm,
  },
  unmirrored: {
    // In a right-to-left layout, 'row-reverse' lays the row out left to right again.
    flexDirection: 'row-reverse',
  },
  start: {
    alignItems: 'center',
    gap: 4,
  },
});
