import { I18nManager, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CURRENT_POSITION, type Place } from '@/domain/place';
import type { StreetPhoto } from '@/domain/street-photo';
import { speak } from '@/services/speech';
import { IconButton } from '@/ui/components/icon-button';
import { StreetPhotoView } from '@/ui/components/street-photo-view';
import { Icon } from '@/ui/icon/icon';
import { TimeDials } from '@/ui/components/time-dials';
import { colors, shadows, spacing } from '@/ui/theme';

import { END_SIZES, EndDisc } from '../components/way-card';
import { ProgressStrip } from './progress-strip';

/** Height of the street photo card above the pill (spec 030). */
export const ARRIVAL_PHOTO_HEIGHT = 124;

type ProgressPanelProps = {
  origin?: Place;
  destination?: Place;
  progress: number;
  remainingMinutes: number;
  /** On the last walk: what the arrival looks like from the street (spec 030). */
  arrivalPhoto?: StreetPhoto;
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
  arrivalPhoto,
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
      {arrivalPhoto && (
        // Above the arrival end of the pill, on its right in every reading direction (the
        // pill never mirrors, spec 006): `left` is swapped in right-to-left.
        <Animated.View
          entering={FadeIn.duration(400)}
          accessible
          accessibilityLabel="Photo de l'arrivée"
          style={[styles.photo, I18nManager.isRTL ? { left: 0 } : { right: 0 }]}
          testID="arrival-street-photo"
        >
          <View style={styles.photoClip}>
            <StreetPhotoView photo={arrivalPhoto} />
          </View>
          {/* The arrival's own pictogram, as on its disc below and its pin on the map. */}
          <View style={styles.photoBadge}>
            <Icon
              name={destination?.icon ?? 'flag'}
              size={18}
              color={colors.white}
              variant="outlined"
            />
          </View>
        </Animated.View>
      )}
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
  // Above the arrival end; « listen » never shows on the last walk. Outside the measured
  // panel too.
  photo: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: spacing.md,
    width: 168,
    height: ARRIVAL_PHOTO_HEIGHT,
  },
  photoClip: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.emerald,
    overflow: 'hidden',
    backgroundColor: colors.surfaceLow,
    boxShadow: shadows.warm,
  },
  photoBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: colors.white,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
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
