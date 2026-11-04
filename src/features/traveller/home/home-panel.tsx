import {
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Place } from '@/domain/place';
import { MainActionButton } from '@/ui/components/main-action-button';
import { Icon } from '@/ui/icon/icon';
import { colors, radii, shadows, spacing } from '@/ui/theme';

import { PlaceTile, tileLayout } from './place-tile';

const CANCEL_SIZE = 56;

type HomePanelProps = {
  /** True while an end of the way waits for a place: the tiles show; else cancel and go. */
  choosing: boolean;
  /** Places offered for the end that calls, in the order of the place sheet. */
  places: readonly Place[];
  onChoose: (place: Place) => void;
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
            contentContainerStyle={[styles.rail, { gap }, I18nManager.isRTL && styles.unmirrored]}
          >
            {places.map((place) => (
              <PlaceTile
                key={place.id}
                place={place}
                size={tile}
                selected={false}
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Annuler"
            onPress={onCancel}
            style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
          >
            <Icon name="close" size={28} color={colors.ink} />
          </Pressable>
          <View style={styles.continue}>
            <MainActionButton icon="check" label="Continuer" tone="emerald" onPress={onContinue} />
          </View>
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
  unmirrored: {
    // In a right-to-left layout, 'row-reverse' lays the row out left to right again.
    flexDirection: 'row-reverse',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  cancel: {
    width: CANCEL_SIZE,
    height: CANCEL_SIZE,
    borderRadius: CANCEL_SIZE / 2,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.warmEdge,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.warm,
  },
  continue: {
    flex: 1,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
});
