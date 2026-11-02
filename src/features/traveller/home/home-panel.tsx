import type { ReactNode } from 'react';
import {
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Place } from '@/domain/place';
import { MainActionButton } from '@/ui/components/main-action-button';
import { Icon } from '@/ui/icon/icon';
import { colors, radii, shadows, sizes, spacing } from '@/ui/theme';

import { PlaceAvatar } from './place-avatar';
import { PlaceCard } from './place-card';

/** Discs of the way (start, arrival). */
const AVATAR = 52;
/** Gap between the card and the screen edges. */
const MARGIN = spacing.md;
/** Inner padding of the card. */
const INNER = spacing.md;
/** About three cards show, the last one cut at the edge invites a swipe. */
const CARDS_SHOWN = 3.1;
/** On a tablet or a wide browser, cards stop growing. */
const CARD_MAX = 160;
/** Cards are a little taller than wide. */
const CARD_RATIO = 1.15;

type HomePanelProps = {
  origin?: Place;
  destination?: Place;
  /** Places offered as an arrival, in the order of the place sheet. */
  places: readonly Place[];
  onOrigin: () => void;
  /** Opens the sheet with every place. */
  onAllPlaces: () => void;
  onChoose: (place: Place) => void;
  onCancel: () => void;
  onContinue: () => void;
  /** Room the card takes at the bottom of the screen, so the map frames above it. */
  onHeight?: (height: number) => void;
};

function End({
  label,
  onPress,
  disabled,
  children,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      // The disc is drawn smaller than a stressed thumb needs: the touch area stays 64 dp.
      hitSlop={(sizes.minTarget - AVATAR) / 2}
      onPress={onPress}
      style={disabled && styles.disabled}
    >
      {children}
    </Pressable>
  );
}

/** Dotted way, drawn with dots: Android cannot dot a single border side. */
function Dots({ color }: { color: string }) {
  return (
    <View style={styles.dots}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.dot, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

/**
 * Floating card of the home (spec 007): the way from the start to the arrival in a grey
 * capsule, then a carousel of place cards; once the arrival is chosen, cancel and continue
 * instead.
 */
export function HomePanel({
  origin,
  destination,
  places,
  onOrigin,
  onAllPlaces,
  onChoose,
  onCancel,
  onContinue,
  onHeight,
}: HomePanelProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(CARD_MAX, Math.round((width - 2 * MARGIN - INNER) / CARDS_SHOWN));
  const cardHeight = Math.round(cardWidth * CARD_RATIO);
  const noStart = origin === undefined;
  const ready = origin !== undefined && destination !== undefined;
  const way = ready ? colors.primary : colors.inkDisabled;
  const bottom = insets.bottom + MARGIN;
  const report = (event: LayoutChangeEvent) =>
    onHeight?.(event.nativeEvent.layout.height + bottom + MARGIN);
  return (
    <View style={[styles.float, { bottom }]} onLayout={report}>
      <View style={styles.card}>
        {/* Never mirrored, like the map: the walker always faces the arrival. */}
        <View style={[styles.way, I18nManager.isRTL && styles.unmirrored]}>
          <End label="Départ" onPress={onOrigin}>
            <PlaceAvatar
              place={origin}
              emptySymbol="location_on"
              badge="location_on"
              size={AVATAR}
              pulsing={!origin}
            />
          </End>
          <Dots color={way} />
          <View style={[styles.walker, ready && styles.walkerReady]}>
            <Icon
              name="directions_walk"
              size={22}
              color={ready ? colors.onPrimary : colors.inkMuted}
            />
          </View>
          <Dots color={way} />
          <End label="Arrivée" onPress={onAllPlaces} disabled={noStart}>
            <PlaceAvatar
              place={destination}
              badge="flag"
              ringed
              size={AVATAR}
              pulsing={!noStart && !destination}
            />
          </End>
        </View>

        {ready ? (
          <View style={[styles.actions, I18nManager.isRTL && styles.unmirrored]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Annuler"
              onPress={onCancel}
              style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
            >
              <Icon name="close" size={28} color={colors.ink} />
            </Pressable>
            <View style={styles.continue}>
              <MainActionButton icon="check" label="Continuer" onPress={onContinue} shape="pill" />
            </View>
          </View>
        ) : (
          // Never mirrored, like the map and the way: the first place stays on the left.
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
            contentContainerStyle={[styles.rail, I18nManager.isRTL && styles.unmirrored]}
          >
            {places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                width={cardWidth}
                height={cardHeight}
                disabled={noStart}
                onPress={() => onChoose(place)}
              />
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tous les lieux"
              onPress={onAllPlaces}
              style={({ pressed }) => [
                styles.all,
                { width: Math.max(sizes.minTarget, cardWidth * 0.6), height: cardHeight },
                pressed && styles.pressed,
              ]}
            >
              <Icon name="more_horiz" size={32} color={colors.ink} />
            </Pressable>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  float: {
    position: 'absolute',
    left: MARGIN,
    right: MARGIN,
  },
  card: {
    paddingVertical: INNER,
    gap: INNER,
    borderRadius: radii.floatingCard,
    backgroundColor: colors.white,
    boxShadow: shadows.float,
  },
  way: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: INNER,
    padding: spacing.xs,
    borderRadius: AVATAR,
    backgroundColor: colors.surfaceLow,
  },
  dots: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  walker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkerReady: {
    backgroundColor: colors.primary,
  },
  unmirrored: {
    // In a right-to-left layout, 'row-reverse' lays the row out left to right again.
    flexDirection: 'row-reverse',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: INNER,
  },
  cancel: {
    width: sizes.minTarget,
    height: sizes.minTarget,
    borderRadius: sizes.minTarget / 2,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continue: {
    flex: 1,
  },
  carousel: {
    flexGrow: 0,
  },
  rail: {
    paddingHorizontal: INNER,
    gap: spacing.sm,
  },
  all: {
    borderRadius: radii.placeCard,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.38,
  },
});
