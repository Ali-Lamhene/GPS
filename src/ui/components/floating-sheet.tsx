import type { ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/ui/theme';

type FloatingSheetProps = {
  children: ReactNode;
  /** Reports the sheet height, so the map keeps its subject above it. */
  onHeight?: (height: number) => void;
  gap?: number;
};

/** White panel floating at the bottom of a map screen (spec 002). */
export function FloatingSheet({ children, onHeight, gap = 14 }: FloatingSheetProps) {
  const insets = useSafeAreaInsets();
  const report = (event: LayoutChangeEvent) => onHeight?.(event.nativeEvent.layout.height);
  return (
    <View
      style={[styles.sheet, { gap, paddingBottom: spacing.lg + insets.bottom }]}
      onLayout={report}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    boxShadow: '0 -4px 16px rgba(0,0,0,.12)',
  },
});
