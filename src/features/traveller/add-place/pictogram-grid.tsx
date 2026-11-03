import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import type { PlaceIcon } from '@/domain/place';
import { PICTOGRAM_CATALOGUE, pictogramName } from '@/domain/pictograms';
import { Icon } from '@/ui/icon/icon';
import { colors, radii, spacing } from '@/ui/theme';

const COLUMNS = 4;
const GAP = 10;
/** The grid scrolls within this share of the screen, so the map and ✓ stay in view. */
const HEIGHT_SHARE = 0.42;

/**
 * Height of the scrolling grid: whole rows, then half of the next one, so the cut row
 * shows there is more below (as the home tiles do), even where no scroll bar shows.
 */
export function cutHeight(available: number, tile: number, gap = GAP): number {
  if (tile <= 0) return Math.round(available);
  const row = tile + gap;
  const whole = Math.max(1, Math.floor((available - tile / 2) / row));
  return Math.round(whole * row + tile / 2);
}

type PictogramGridProps = {
  selected?: PlaceIcon;
  onSelect: (icon: PlaceIcon) => void;
};

/**
 * The whole catalogue of pictograms (spec 011), four per row, grouped by family. A thin
 * line, never a written title, separates the families; each pictogram has its French name
 * for screen readers only.
 */
export function PictogramGrid({ selected, onSelect }: PictogramGridProps) {
  const [width, setWidth] = useState(0);
  const { height } = useWindowDimensions();
  const tile = width > 0 ? (width - GAP * (COLUMNS - 1)) / COLUMNS : 0;

  return (
    <ScrollView
      style={{ maxHeight: cutHeight(height * HEIGHT_SHARE, tile) }}
      contentContainerStyle={styles.families}
      showsVerticalScrollIndicator
    >
      <View
        testID="pictogram-grid"
        style={styles.families}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      >
        {tile > 0 &&
          PICTOGRAM_CATALOGUE.map(({ family, pictograms }, index) => (
            <View key={family} style={styles.family} testID={`family-${family}`}>
              {index > 0 && <View style={styles.separator} />}
              <View style={styles.grid}>
                {pictograms.map(({ icon }) => {
                  const on = icon === selected;
                  return (
                    <Pressable
                      key={icon}
                      accessibilityRole="radio"
                      accessibilityLabel={pictogramName(icon)}
                      accessibilityState={{ checked: on }}
                      onPress={() => onSelect(icon)}
                      style={[
                        styles.tile,
                        { width: tile, height: tile },
                        on && { backgroundColor: colors.emerald },
                      ]}
                    >
                      <Icon
                        name={icon}
                        size={34}
                        color={on ? colors.white : colors.emerald}
                        variant={on ? 'filled' : 'outlined'}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  families: {
    gap: spacing.md,
  },
  family: {
    gap: spacing.md,
  },
  separator: {
    height: 1,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceHighest,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  tile: {
    borderRadius: radii.control,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
