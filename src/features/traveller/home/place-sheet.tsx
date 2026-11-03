import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Place } from '@/domain/place';
import { Icon } from '@/ui/icon/icon';
import { colors, radii, shadows, spacing } from '@/ui/theme';

import type { TripEnd } from '../trip-plan/trip-plan-reducer';
import { SheetPlaceTile } from './sheet-place-tile';

const COLUMNS = 3;
const GAP = 12;

type PlaceSheetProps = {
  end: TripEnd;
  places: Place[];
  /** Place that cannot be picked here: the start, when choosing the arrival. */
  excludedId?: string;
  onPick: (place: Place) => void;
  onClose: () => void;
};

/**
 * Bottom sheet of saved places, to choose the start (E02) or the arrival (E04). Only to
 * choose: places are added from the home « + » (spec 007).
 */
export function PlaceSheet({ end, places, excludedId, onPick, onClose }: PlaceSheetProps) {
  const insets = useSafeAreaInsets();
  const [gridWidth, setGridWidth] = useState(0);
  const tile = gridWidth > 0 ? (gridWidth - GAP * (COLUMNS - 1)) / COLUMNS : 0;

  // Android's back button closes the sheet instead of leaving home.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [onClose]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fermer"
        onPress={onClose}
        style={[StyleSheet.absoluteFill, styles.scrim]}
      />
      <View style={[styles.sheet, { bottom: spacing.gutter + insets.bottom }]}>
        <Icon
          name={end === 'origin' ? 'location_on' : 'flag'}
          size={30}
          color={colors.emerald}
          variant="outlined"
        />
        <View
          testID="place-grid"
          style={styles.grid}
          onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}
        >
          {tile > 0 && (
            <>
              {places.map((place) => (
                <SheetPlaceTile
                  key={place.id}
                  place={place}
                  size={tile}
                  disabled={place.id === excludedId}
                  onPress={() => onPick(place)}
                />
              ))}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: colors.scrim,
  },
  sheet: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    backgroundColor: colors.warmWhite,
    borderRadius: radii.sheet,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    boxShadow: shadows.sheet,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
});
