import { I18nManager, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CURRENT_POSITION, type Place } from '@/domain/place';
import { speak } from '@/services/speech';
import { IconButton } from '@/ui/components/icon-button';
import { TimeDials } from '@/ui/components/time-dials';
import { colors, shadows, spacing } from '@/ui/theme';

import { END_SIZES, EndDisc } from '../components/way-card';
import { ProgressStrip } from './progress-strip';

type ProgressPanelProps = {
  origin?: Place;
  destination?: Place;
  progress: number;
  remainingMinutes: number;
  /** Stop or station name the traveller can listen to at this step (D9). */
  spokenName?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
};

/**
 * Bottom of the guidance (specs 010, 027): a warm-white pill with the start place and the
 * time left at one end, the arrival place at the other, as on the home pill (pin and flag
 * badges), the way done in emerald dots between them; the round « listen » button stands
 * above it when the step has a station name.
 */
export function ProgressPanel({
  origin,
  destination,
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
          {/* « Here » was where the traveller stood at the start, not where they are now: a
              plain start disc, never the pin of « me » (spec 027). */}
          <EndDisc
            end="origin"
            place={origin?.id === CURRENT_POSITION.id ? undefined : origin}
            calling={false}
            size={END_SIZES.compact}
          />
          <TimeDials minutes={remainingMinutes} size={34} crossColor={colors.white} gap={3} />
        </View>
        <ProgressStrip progress={progress} />
        <EndDisc end="destination" place={destination} calling={false} size={END_SIZES.compact} />
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
