import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Leg } from '@/domain/trip';
import { speak } from '@/services/speech';
import { TimeDials } from '@/ui/components/time-dials';
import { Icon, type IconName } from '@/ui/icon/icon';
import { colors, sizes } from '@/ui/theme';

import { ProgressStrip } from './progress-strip';

type ProgressPanelProps = {
  legs: readonly Leg[];
  progress: number;
  remainingMinutes: number;
  /** Stop or station name the traveller can listen to at this step (D9). */
  spokenName?: string;
  destinationIcon: IconName;
  onLayout?: (event: LayoutChangeEvent) => void;
};

/** White panel floating at the bottom of the map: time left, progress, listen. */
export function ProgressPanel({
  legs,
  progress,
  remainingMinutes,
  spokenName,
  destinationIcon,
  onLayout,
}: ProgressPanelProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.panel, { paddingBottom: 16 + insets.bottom }]} onLayout={onLayout}>
      <View style={styles.progress}>
        <TimeDials minutes={remainingMinutes} size={52} crossColor={colors.white} gap={8} />
        <View style={styles.strip}>
          <ProgressStrip legs={legs} progress={progress} destinationIcon={destinationIcon} />
        </View>
        {/* Empty slot without a name: the dials and the strip never move. */}
        {spokenName ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Écouter le nom"
            onPress={() => void speak(spokenName)}
            style={styles.listen}
          >
            <Icon name="volume_up" size={32} color={colors.primary} />
          </Pressable>
        ) : (
          <View style={styles.listenSlot} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 14,
    boxShadow: '0 -4px 16px rgba(0,0,0,.12)',
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  strip: {
    flex: 1,
  },
  listenSlot: {
    width: sizes.minTarget,
  },
  listen: {
    width: sizes.minTarget,
    height: sizes.minTarget,
    borderRadius: sizes.minTarget / 2,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
