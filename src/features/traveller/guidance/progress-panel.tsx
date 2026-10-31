import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Leg } from '@/domain/trip';
import { speak } from '@/services/speech';
import { GrabHandle } from '@/ui/components/grab-handle';
import { HelpButton } from '@/ui/components/help-button';
import { TimeDials } from '@/ui/components/time-dials';
import { Icon } from '@/ui/icon/icon';
import { colors, radii, shadows, sizes } from '@/ui/theme';

import { ProgressStrip } from './progress-strip';

type ProgressPanelProps = {
  legs: readonly Leg[];
  progress: number;
  remainingMinutes: number;
  /** Stop or station name the traveller can listen to at this step (D9). */
  spokenName?: string;
  onHelp: () => void;
};

/** Bottom panel of the guidance: time left, where the traveller is, listen and help. */
export function ProgressPanel({
  legs,
  progress,
  remainingMinutes,
  spokenName,
  onHelp,
}: ProgressPanelProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.panel, { paddingBottom: 24 + insets.bottom }]}>
      <GrabHandle />
      <View style={styles.progress}>
        <TimeDials minutes={remainingMinutes} size={60} crossColor={colors.surfaceLow} gap={14} />
        <ProgressStrip legs={legs} progress={progress} />
      </View>
      <View style={styles.actions}>
        {spokenName ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Écouter le nom"
            onPress={() => void speak(spokenName)}
            style={styles.listen}
          >
            <Icon name="volume_up" size={36} color={colors.onPrimary} />
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}
        <HelpButton onPress={onHelp} shape="square" size={sizes.actionButton} iconSize={36} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    height: 220,
    backgroundColor: colors.surfaceLow,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingHorizontal: 20,
    gap: 18,
    boxShadow: shadows.sheet,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actions: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listen: {
    flex: 1,
    height: sizes.actionButton,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.low,
  },
  spacer: {
    flex: 1,
  },
});
