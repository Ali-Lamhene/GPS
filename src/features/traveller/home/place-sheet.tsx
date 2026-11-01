import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Place } from '@/domain/place';
import { CompanionEntryTile } from '@/features/social-worker/companion-entry-tile';
import { GrabHandle } from '@/ui/components/grab-handle';
import { Icon } from '@/ui/icon/icon';
import { colors, radii, spacing } from '@/ui/theme';

import type { TripEnd } from '../trip-plan/trip-plan-reducer';
import { AddPlaceTile } from './add-place-tile';
import { SheetPlaceTile } from './sheet-place-tile';

const COLUMNS = 3;
const GAP = 12;

type PlaceSheetProps = {
  end: TripEnd;
  places: Place[];
  /** Place that cannot be picked here: the start, when choosing the arrival. */
  excludedId?: string;
  onPick: (place: Place) => void;
  onAddPosition: () => void;
  onCompanion: () => void;
  onClose: () => void;
};

/** Bottom sheet of saved places, to choose the start (E02) or the arrival (E04). */
export function PlaceSheet({
  end,
  places,
  excludedId,
  onPick,
  onAddPosition,
  onCompanion,
  onClose,
}: PlaceSheetProps) {
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
      <View style={[styles.sheet, { paddingBottom: spacing.xxl + insets.bottom }]}>
        <GrabHandle />
        <Icon name={end === 'origin' ? 'trip_origin' : 'flag'} size={30} color={colors.inkMuted} />
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
              <AddPlaceTile size={tile} onPress={onAddPosition} />
              <View style={{ width: tile }}>
                <CompanionEntryTile onEnter={onCompanion} />
              </View>
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
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
});
