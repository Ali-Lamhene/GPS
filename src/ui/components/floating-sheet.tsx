import type { ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, shadows, spacing } from '@/ui/theme';

type FloatingSheetProps = {
  children: ReactNode;
  /** Reports the sheet height, so the map keeps its subject above it. */
  onHeight?: (height: number) => void;
  gap?: number;
};

/**
 * Warm-white card floating at the bottom of a map screen (specs 008, 010): detached from the edges,
 * large rounded corners and a soft shadow.
 */
export function FloatingSheet({ children, onHeight, gap = 14 }: FloatingSheetProps) {
  const insets = useSafeAreaInsets();
  const report = (event: LayoutChangeEvent) => onHeight?.(event.nativeEvent.layout.height);
  return (
    <View style={[styles.sheet, { gap, bottom: spacing.gutter + insets.bottom }]} onLayout={report}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    backgroundColor: colors.warmWhite,
    borderRadius: radii.sheet,
    padding: spacing.lg,
    boxShadow: shadows.sheet,
  },
});
