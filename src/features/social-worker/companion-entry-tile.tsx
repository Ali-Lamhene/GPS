import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Icon } from '@/ui/icon/icon';
import { colors, fontFamilies, radii } from '@/ui/theme';

import { useHoldProgress } from './use-hold-progress';

const HOLD_MS = 3000;
const RADIUS = radii.control;
const RING = 3;

/** Rounded square outline starting at top centre, clockwise, and its length. */
export function ringPath(size: number): { d: string; length: number } {
  const i = RING / 2;
  const r = RADIUS - i;
  const far = size - i;
  const d = [
    `M ${size / 2} ${i}`,
    `H ${far - r}`,
    `A ${r} ${r} 0 0 1 ${far} ${i + r}`,
    `V ${far - r}`,
    `A ${r} ${r} 0 0 1 ${far - r} ${far}`,
    `H ${i + r}`,
    `A ${r} ${r} 0 0 1 ${i} ${far - r}`,
    `V ${i + r}`,
    `A ${r} ${r} 0 0 1 ${i + r} ${i}`,
    'Z',
  ].join(' ');
  const length = 4 * (size - 2 * i - 2 * r) + 2 * Math.PI * r;
  return { d, length };
}

type CompanionEntryTileProps = {
  onEnter: () => void;
};

/**
 * Entry to the companion area, in the traveller's place sheet (E02, E04): a 3 second
 * press fills the ring, then opens the address form. Text here is for the companion
 * (open question 11 in docs/status.md).
 */
export function CompanionEntryTile({ onEnter }: CompanionEntryTileProps) {
  const [size, setSize] = useState(0);
  const { progress, start, cancel } = useHoldProgress(HOLD_MS, onEnter);
  const ring = ringPath(size);

  return (
    <View style={styles.cell} onLayout={(event) => setSize(event.nativeEvent.layout.width)}>
      {size > 0 && (
        <Svg style={StyleSheet.absoluteFill} width={size} height={size} pointerEvents="none">
          <Path d={ring.d} fill="none" stroke={colors.holdTrack} strokeWidth={RING} />
          {progress > 0 && (
            <Path
              d={ring.d}
              fill="none"
              stroke={colors.primary}
              strokeWidth={RING}
              strokeDasharray={[progress * ring.length, ring.length]}
            />
          )}
        </Svg>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Accompagnant : appui long 3 secondes"
        onPressIn={start}
        onPressOut={cancel}
        style={styles.button}
      >
        <Icon name="edit_location_alt" size={32} color={colors.inkMuted} variant="outlined" />
        <Text style={styles.title}>Accompagnant</Text>
        <View style={styles.hint}>
          <Icon name="touch_app" size={13} color={colors.inkMuted} variant="outlined" />
          <Text style={styles.hintText}>appui 3 s</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    aspectRatio: 1,
    padding: RING,
  },
  button: {
    flex: 1,
    borderRadius: RADIUS - RING,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  title: {
    fontSize: 11,
    lineHeight: 12,
    fontFamily: fontFamilies.bold,
    color: colors.inkMuted,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  hintText: {
    fontSize: 11,
    lineHeight: 12,
    fontFamily: fontFamilies.medium,
    color: colors.inkMuted,
  },
});
