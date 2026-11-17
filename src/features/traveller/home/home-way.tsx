import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Place } from '@/domain/place';
import { CancelConfirm } from '@/ui/components/cancel-confirm';
import { spacing } from '@/ui/theme';

import { WayCard } from '../components/way-card';
import type { TripEnd } from '../trip-plan/trip-plan-reducer';

type HomeWayProps = {
  origin?: Place;
  destination?: Place;
  /** The end still empty, which calls with a halo and a hand. */
  calling?: TripEnd;
  /** A touch on an end of the way opens every place for it (spec 035). */
  onEnd: (end: TripEnd) => void;
  onCancel: () => void;
  onContinue: () => void;
  /** Room taken at the bottom of the screen, so the map frames above it. */
  onHeight?: (height: number) => void;
};

/**
 * Bottom of the home (spec 035): the way, start ····· arrival, which never moves; once both
 * ends are chosen, cancel and continue appear above it. There are no place shortcuts: the
 * traveller chooses on the map or by touching an end of the way.
 */
export function HomeWay({
  origin,
  destination,
  calling,
  onEnd,
  onCancel,
  onContinue,
  onHeight,
}: HomeWayProps) {
  const insets = useSafeAreaInsets();
  const bottom = insets.bottom + spacing.gutter;
  const report = (event: LayoutChangeEvent) => onHeight?.(event.nativeEvent.layout.height + bottom);

  return (
    <View style={[styles.block, { bottom }]} onLayout={report}>
      {calling === undefined && (
        <Animated.View entering={FadeInDown.springify().damping(18)}>
          <CancelConfirm
            onCancel={onCancel}
            onConfirm={onContinue}
            cancelLabel="Annuler"
            confirmLabel="Continuer"
          />
        </Animated.View>
      )}
      <WayCard
        size="large"
        origin={origin}
        destination={destination}
        calling={calling}
        onEnd={onEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    gap: spacing.md,
  },
});
