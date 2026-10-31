import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, sizes, spacing } from '@/ui/theme';

type ScreenFrameProps = {
  children: ReactNode;
  /** Main action disc, centred at the bottom above the content. */
  action?: ReactNode;
  gap?: number;
  background?: string;
};

/** Page layout shared by the full-page screens: safe-area padding and the bottom action. */
export function ScreenFrame({
  children,
  action,
  gap = 18,
  background = colors.surface,
}: ScreenFrameProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        {
          gap,
          backgroundColor: background,
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.xxl + (action ? sizes.mainAction : 0),
        },
      ]}
    >
      {children}
      {action && (
        <View
          pointerEvents="box-none"
          style={[styles.action, { bottom: insets.bottom + spacing.xxl }]}
        >
          {action}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  action: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
