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

import { PlaceTile, tileSize } from './place-tile';

const GAP = spacing.md;
const CANCEL_SIZE = 56;

type HomePanelProps = {
  /** True while an end of the way waits for a place: the tiles show; else cancel and go. */
  choosing: boolean;
  /** Places offered for the end that calls, in the order of the place sheet. */
  places: readonly Place[];
  /** The place already chosen for the end that calls, ringed in emerald. */
  selectedId?: string;
  onChoose: (place: Place) => void;
  /** Opens the sheet with every place. */
  onAllPlaces: () => void;
  onCancel: () => void;
  onContinue: () => void;
  /** Room taken at the bottom of the screen, so the map frames above it. */
  onHeight?: (height: number) => void;
};

/**
 * Bottom of the home (spec 009): a warm-white panel with square place tiles to fill the
 * end that calls, swiped sideways, then « … » for every place; once both ends are chosen,
 * cancel and continue.
 */
export function HomePanel({
  choosing,
  places,
  selectedId,
  onChoose,
  onAllPlaces,
  onCancel,
  onContinue,
  onHeight,
}: HomePanelProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const tile = tileSize(screenWidth - 2 * spacing.gutter, GAP, spacing.lg);
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
            snapToInterval={tile + GAP}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={[styles.rail, I18nManager.isRTL && styles.unmirrored]}
          >
            {places.map((place) => (
              <PlaceTile
                key={place.id}
                place={place}
                size={tile}
                selected={place.id === selectedId}
                onPress={() => onChoose(place)}
              />
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tous les lieux"
              onPress={onAllPlaces}
              style={({ pressed }) => [
                styles.all,
                { width: tile, height: tile },
                pressed && styles.pressed,
              ]}
            >
              <Icon name="more_horiz" size={34} color={colors.emerald} variant="outlined" />
            </Pressable>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    borderRadius: radii.sheet,
    backgroundColor: colors.warmWhite,
    boxShadow: shadows.sheet,
    overflow: 'hidden',
  },
  rail: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: GAP,
  },
  unmirrored: {
    // In a right-to-left layout, 'row-reverse' lays the row out left to right again.
    flexDirection: 'row-reverse',
  },
  all: {
    borderRadius: radii.tile,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.warmEdge,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.warm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
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
