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
import { colors, radii, shadows, sizes, spacing } from '@/ui/theme';

import { PlaceCard } from './place-card';

const GAP = spacing.md;
/** Cards are about three quarters of the screen wide (spec 008)… */
const CARD_SHARE = 0.75;
/** …but stop growing on a tablet or a wide browser. */
const CARD_MAX = 360;
/** And at least 200 dp high. */
const CARD_MIN_HEIGHT = 200;

/** Size of the place cards for a screen width (spec 008). */
export function cardSize(screenWidth: number): { width: number; height: number } {
  const width = Math.min(CARD_MAX, Math.round(screenWidth * CARD_SHARE));
  return { width, height: Math.max(CARD_MIN_HEIGHT, Math.round(width * 0.82)) };
}

type HomePanelProps = {
  /** True while an end of the way waits for a place: the cards show; else cancel and go. */
  choosing: boolean;
  /** Places offered for the end that calls, in the order of the place sheet. */
  places: readonly Place[];
  onChoose: (place: Place) => void;
  /** Opens the sheet with every place. */
  onAllPlaces: () => void;
  onCancel: () => void;
  onContinue: () => void;
  /** Room taken at the bottom of the screen, so the map frames above it. */
  onHeight?: (height: number) => void;
};

/**
 * Bottom of the home (spec 008): big place cards to fill the end that calls, swiped one by
 * one, then « … » for every place; once both ends are chosen, cancel and continue.
 */
export function HomePanel({
  choosing,
  places,
  onChoose,
  onAllPlaces,
  onCancel,
  onContinue,
  onHeight,
}: HomePanelProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const card = cardSize(screenWidth);
  const bottom = insets.bottom + spacing.gutter;
  const report = (event: LayoutChangeEvent) => onHeight?.(event.nativeEvent.layout.height + bottom);

  if (!choosing) {
    return (
      <Animated.View
        key="actions"
        entering={FadeInDown.springify().damping(18)}
        style={[styles.actions, { bottom }]}
        onLayout={report}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Annuler"
          onPress={onCancel}
          style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
        >
          <Icon name="close" size={30} color={colors.ink} />
        </Pressable>
        <View style={styles.continue}>
          <MainActionButton icon="check" label="Continuer" onPress={onContinue} />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      key="cards"
      entering={FadeInDown.springify().damping(18)}
      style={[styles.rail, { bottom }]}
      onLayout={report}
    >
      {/* Never mirrored, like the map and the way: the first place stays on the left. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={card.width + GAP}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={[styles.railContent, I18nManager.isRTL && styles.unmirrored]}
      >
        {places.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            width={card.width}
            height={card.height}
            onPress={() => onChoose(place)}
          />
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tous les lieux"
          onPress={onAllPlaces}
          style={({ pressed }) => [
            styles.all,
            { width: Math.max(sizes.minTarget, card.width * 0.45), height: card.height },
            pressed && styles.pressed,
          ]}
        >
          <Icon name="more_horiz" size={40} color={colors.white} />
        </Pressable>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rail: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  railContent: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xs,
    gap: GAP,
  },
  unmirrored: {
    // In a right-to-left layout, 'row-reverse' lays the row out left to right again.
    flexDirection: 'row-reverse',
  },
  all: {
    borderRadius: radii.placeCard,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.float,
  },
  actions: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cancel: {
    width: sizes.minTarget,
    height: sizes.minTarget,
    borderRadius: sizes.minTarget / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.float,
  },
  continue: {
    flex: 1,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
