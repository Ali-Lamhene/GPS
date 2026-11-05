import {
  I18nManager,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CURRENT_POSITION, type Place } from '@/domain/place';
import { CancelConfirm } from '@/ui/components/cancel-confirm';
import { colors, radii, shadows, spacing } from '@/ui/theme';

import { AddPlaceTile } from './add-place-tile';
import type { HereUnavailable } from './here-state';
import { PlaceTile, TILE_RADIUS, tileLayout } from './place-tile';

type HomePanelProps = {
  /** True while an end of the way waits for a place: the tiles show; else cancel and go. */
  choosing: boolean;
  /** Places offered for the end that calls, in the order of the place sheet. */
  places: readonly Place[];
  onChoose: (place: Place) => void;
  /** No place to offer: the only tile opens « new place here » (spec 015). */
  onAdd: () => void;
  /** No usable position (spec 017): « here » and « + » greyed. */
  hereUnavailable?: HereUnavailable;
  onCancel: () => void;
  onContinue: () => void;
  /** Room taken at the bottom of the screen, so the map frames above it. */
  onHeight?: (height: number) => void;
};

/**
 * Bottom of the home (specs 009, 011, 012): a slim warm-white panel with small square place tiles,
 * shortcuts that fill the end that calls, swiped sideways; once both ends are chosen,
 * cancel and continue. Every place opens from the ends of the way.
 */
export function HomePanel({
  choosing,
  places,
  onChoose,
  onAdd,
  hereUnavailable,
  onCancel,
  onContinue,
  onHeight,
}: HomePanelProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  // The rail starts one padding inside the panel; the panel edge cuts the last tile.
  const { size: tile, gap } = tileLayout(screenWidth - 2 * spacing.gutter - spacing.md);
  const bottom = insets.bottom + spacing.gutter;
  const report = (event: LayoutChangeEvent) => onHeight?.(event.nativeEvent.layout.height + bottom);

  return (
    <View style={[styles.panel, { bottom }]} onLayout={report}>
      {choosing ? (
        <Animated.View key="tiles" entering={FadeInDown.springify().damping(18)}>
          {/* Never mirrored, like the map and the way: the first place stays on the left. */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={tile + gap}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={[
              styles.rail,
              { gap },
              I18nManager.isRTL && styles.unmirrored,
              // The lone « + » of an empty home sits in the middle of the panel (spec 015).
              places.length === 0 && styles.centred,
            ]}
          >
            {places.length === 0 && (
              <AddPlaceTile
                size={tile}
                radius={TILE_RADIUS}
                unavailable={hereUnavailable}
                onPress={onAdd}
              />
            )}
            {places.map((place) => (
              <PlaceTile
                key={place.id}
                place={place}
                size={tile}
                selected={false}
                unavailable={place.id === CURRENT_POSITION.id ? hereUnavailable : undefined}
                onPress={() => onChoose(place)}
              />
            ))}
          </ScrollView>
        </Animated.View>
      ) : (
        <Animated.View
          key="actions"
          entering={FadeInDown.springify().damping(18)}
          style={styles.actions}
        >
          <CancelConfirm
            onCancel={onCancel}
            onConfirm={onContinue}
            cancelLabel="Annuler"
            confirmLabel="Continuer"
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderRadius: radii.sheet,
    backgroundColor: colors.warmWhite,
    boxShadow: shadows.sheet,
    overflow: 'hidden',
  },
  rail: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  centred: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  unmirrored: {
    // In a right-to-left layout, 'row-reverse' lays the row out left to right again.
    flexDirection: 'row-reverse',
  },
  actions: {
    paddingHorizontal: spacing.md,
  },
});
