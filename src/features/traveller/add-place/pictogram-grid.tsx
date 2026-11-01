import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PICTOGRAM_CHOICES, type PlaceIcon } from '@/domain/place';
import { Icon } from '@/ui/icon/icon';
import { colors, radii } from '@/ui/theme';

const COLUMNS = 4;
const GAP = 10;

type PictogramGridProps = {
  selected?: PlaceIcon;
  onSelect: (icon: PlaceIcon) => void;
};

/** The pictograms a new place can wear, four per row. */
export function PictogramGrid({ selected, onSelect }: PictogramGridProps) {
  const [width, setWidth] = useState(0);
  const tile = width > 0 ? (width - GAP * (COLUMNS - 1)) / COLUMNS : 0;

  return (
    <View
      testID="pictogram-grid"
      style={styles.grid}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {tile > 0 &&
        PICTOGRAM_CHOICES.map((icon) => {
          const on = icon === selected;
          return (
            <Pressable
              key={icon}
              accessibilityRole="radio"
              accessibilityLabel={icon}
              accessibilityState={{ checked: on }}
              onPress={() => onSelect(icon)}
              style={[
                styles.tile,
                { width: tile, height: tile },
                on && { backgroundColor: colors.primary },
              ]}
            >
              <Icon name={icon} size={36} color={on ? colors.white : colors.ink} />
            </Pressable>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
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
