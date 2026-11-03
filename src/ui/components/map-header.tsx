import type { ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/ui/theme';

type MapHeaderProps = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  /** Reports the space the header takes from the top of the screen. */
  onHeight?: (height: number) => void;
};

/** Buttons floating over the top of a map screen: back or home, a reminder, help. */
export function MapHeader({ left, center, right, onHeight }: MapHeaderProps) {
  const insets = useSafeAreaInsets();
  const top = insets.top + spacing.md;
  const report = (event: LayoutChangeEvent) => onHeight?.(top + event.nativeEvent.layout.height);
  return (
    <View style={[styles.header, { top }]} onLayout={report} pointerEvents="box-none">
      <View style={styles.side}>{left}</View>
      {center && <View style={styles.center}>{center}</View>}
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: {
    minWidth: 44,
  },
  center: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  right: {
    alignItems: 'flex-end',
  },
});
