import type { ReactNode } from 'react';
import {
  I18nManager,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isHiddenOnMap, type Place } from '@/domain/place';
import { MainActionButton } from '@/ui/components/main-action-button';
import { Icon } from '@/ui/icon/icon';
import { colors, radii, sizes, spacing } from '@/ui/theme';

import { PlaceAvatar } from './place-avatar';

/** At most this many saved places as shortcuts, before the "all places" one. */
const MAX_SHORTCUTS = 4;
const AVATAR = 52;
/** Room between two 64 dp shortcut targets: the 52 dp discs stay 14 dp apart. */
const SHORTCUT_GAP = 2;

/** How many shortcuts fit beside "all places" on this screen width (320 dp phones too). */
export function shortcutCount(screenWidth: number): number {
  const room = screenWidth - 2 * spacing.lg + SHORTCUT_GAP;
  const fit = Math.floor(room / (sizes.minTarget + SHORTCUT_GAP)) - 1;
  return Math.max(0, Math.min(MAX_SHORTCUTS, fit));
}

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
  onHeight?: (height: number) => void;
};

function Target({
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
      onPress={onPress}
      style={[styles.target, disabled && styles.disabled]}
    >
      {children}
    </Pressable>
  );
}

/** Dotted way, drawn with dots: Android cannot dot a single border side. */
function Dots({ color }: { color: string }) {
  return (
    <View style={styles.dots}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[styles.dot, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

/**
 * Bottom panel of the home (spec 005): the way from the start to the arrival, then the
 * shortcuts to the places; once the arrival is chosen, cancel and continue instead.
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
  const noStart = origin === undefined;
  const ready = origin !== undefined && destination !== undefined;
  const way = ready ? colors.primary : colors.inkDisabled;
  const report = (event: LayoutChangeEvent) => onHeight?.(event.nativeEvent.layout.height);

  return (
    <View style={[styles.panel, { paddingBottom: spacing.lg + insets.bottom }]} onLayout={report}>
      {/* Never mirrored, like the map: the walker always faces the arrival. */}
      <View style={[styles.row, I18nManager.isRTL && styles.unmirrored]}>
        <Target label="Départ" onPress={onOrigin}>
          <PlaceAvatar
            place={origin}
            emptySymbol="trip_origin"
            badge="trip_origin"
            size={AVATAR}
            pulsing={!origin}
          />
        </Target>
        <Dots color={way} />
        <Icon name="directions_walk" size={26} color={ready ? colors.primary : colors.inkMuted} />
        <Dots color={way} />
        <Target label="Arrivée" onPress={onAllPlaces} disabled={noStart}>
          <PlaceAvatar
            place={destination}
            badge="flag"
            ringed
            size={AVATAR}
            pulsing={!noStart && !destination}
          />
        </Target>
      </View>

      {ready ? (
        <View style={[styles.row, styles.actions]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Annuler"
            onPress={onCancel}
            style={styles.cancel}
          >
            <Icon name="close" size={30} color={colors.ink} />
          </Pressable>
          <View style={styles.continue}>
            <MainActionButton icon="check" label="Continuer" onPress={onContinue} />
          </View>
        </View>
      ) : (
        <View style={styles.shortcuts}>
          {places.slice(0, shortcutCount(width)).map((place) => (
            <Target
              key={place.id}
              label={place.helpName ?? 'Lieu'}
              onPress={() => onChoose(place)}
              disabled={noStart}
            >
              {/* Seen as soon as the app opens: a hidden place shows no facade (spec 005). */}
              <PlaceAvatar place={place} size={AVATAR} showPhoto={!isHiddenOnMap(place)} />
            </Target>
          ))}
          <Target label="Tous les lieux" onPress={onAllPlaces}>
            <View style={styles.all}>
              <Icon name="more_horiz" size={28} color={colors.ink} />
            </View>
          </Target>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.homePanel,
    borderTopRightRadius: radii.homePanel,
    boxShadow: '0 -4px 18px rgba(0,0,0,.12)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  target: {
    width: sizes.minTarget,
    height: sizes.minTarget,
    alignItems: 'center',
    justifyContent: 'center',
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
  unmirrored: {
    // In a right-to-left layout, 'row-reverse' lays the row out left to right again.
    flexDirection: 'row-reverse',
  },
  actions: {
    gap: spacing.lg,
  },
  disabled: {
    opacity: 0.38,
  },
  shortcuts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SHORTCUT_GAP,
  },
  all: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    width: sizes.minTarget,
    height: sizes.minTarget,
    borderRadius: radii.control,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continue: {
    flex: 1,
  },
});
