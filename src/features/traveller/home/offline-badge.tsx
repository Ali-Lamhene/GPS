import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { playCue } from '@/services/feedback';
import { Icon } from '@/ui/icon/icon';
import { colors, shadows, spacing } from '@/ui/theme';

const SIZE = 44;

type OfflineBadgeProps = {
  /** Distance from the top of the screen, just under the way. */
  top: number;
};

/**
 * No network (spec 017): the orange crossed-out cloud of E25, filled, on a white disc ringed
 * in orange, under the way at the top of the home, with the « offline » sound and vibration
 * once when it shows. The map stays blank where it could not load; everything else works.
 */
export function OfflineBadge({ top }: OfflineBadgeProps) {
  useEffect(() => {
    playCue('offline');
  }, []);

  return (
    <Animated.View
      testID="offline-badge"
      pointerEvents="none"
      entering={FadeIn}
      exiting={FadeOut}
      style={[styles.badge, { top }]}
    >
      <View style={styles.disc}>
        <Icon name="cloud_off" size={24} color={colors.alert} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    left: spacing.gutter,
  },
  disc: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.alert,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.warm,
  },
});
