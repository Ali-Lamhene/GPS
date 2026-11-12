import { Pressable, StyleSheet, View } from 'react-native';

import type { Place } from '@/domain/place';
import { isAlert, type Instruction } from '@/domain/guidance';
import { PulseRing } from '@/ui/components/pulse-ring';
import { Icon } from '@/ui/icon/icon';
import { colors, radii, shadows } from '@/ui/theme';

import { LineBadge, MetroSign } from '../components/line-badge';
import { StationName } from '../components/station-name';
import { mainSymbol, nextSymbol } from './instruction-look';
import { TurnGauge } from './turn-gauge';

const TILE_RADIUS = 24;

type InstructionCardProps = {
  instruction: Instruction;
  destination?: Place;
  /** For a turn: share of the approach left before the corner, from 1 to 0. */
  approach?: number;
  /**
   * Without a position (metro, signal lost) touching the card moves on to the next step
   * (spec 021). With a position it is left out: only walking moves the guidance on.
   */
  onPress?: () => void;
  /**
   * The traveller left the way (spec 031): orange frame and the crossed pin, the old
   * instruction kept inside; turning arrows while a new trip is asked.
   */
  offRoute?: 'lost' | 'computing';
  /** Lost for a while (spec 034): only help pulses, the card stays orange but still. */
  still?: boolean;
};

/**
 * Warm-white card floating over the map (spec 010): the one thing to do now, very large,
 * edged in the « right way » green; a turn sits in a ring that empties as the corner comes
 * closer. Peach with an orange bell to get off.
 */
export function InstructionCard({
  instruction,
  destination,
  approach,
  onPress,
  offRoute,
  still = false,
}: InstructionCardProps) {
  const alert = offRoute !== undefined || isAlert(instruction);
  const symbol = mainSymbol(instruction);
  const next = offRoute ? undefined : nextSymbol(instruction, destination);
  const leg = 'leg' in instruction ? instruction.leg : undefined;
  const turn = instruction.kind === 'walk' && instruction.turn !== 'straight';

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? 'Étape suivante' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={[styles.card, alert ? styles.alert : styles.onTrack]}
    >
      <View style={styles.top}>
        {turn && symbol !== 'metro' ? (
          <TurnGauge turn={symbol} left={approach ?? 1} />
        ) : (
          <View
            style={[
              styles.tile,
              symbol === 'metro' ? styles.bareTile : alert ? styles.alertTile : styles.plainTile,
            ]}
          >
            {alert && !still && <PulseRing borderRadius={TILE_RADIUS} color={colors.alert} />}
            {symbol === 'metro' && leg ? (
              <MetroSign color={leg.line.color} size={60} />
            ) : symbol !== 'metro' ? (
              <Icon
                name={symbol}
                size={50}
                color={alert ? colors.alert : colors.emerald}
                variant="outlined"
              />
            ) : null}
          </View>
        )}
        {/* The line id on every step of a ride, not only while waiting (spec 010). */}
        {leg && <LineBadge line={leg.line} size="lg" />}
        <View style={styles.spacer} />
        {offRoute && (
          <View style={styles.offRoute} testID={`off-route-${offRoute}`}>
            {!still && <PulseRing borderRadius={28} color={colors.alert} />}
            <Icon
              name={offRoute === 'computing' ? 'autorenew' : 'wrong_location'}
              size={34}
              color={colors.alert}
              variant="outlined"
            />
          </View>
        )}
        {next && (
          <View style={styles.next}>
            <Icon name={next} size={30} color={colors.emerald} variant="outlined" />
          </View>
        )}
      </View>
      {/* Touching moves on now (no recent position): the hand that means « touch » (spec 031). */}
      {onPress && (
        <View style={styles.touchHint} testID="instruction-touch-hint">
          <Icon name="touch_app" size={30} color={colors.ink} />
        </View>
      )}
      {/* Names take the whole width, so they break like the sign they are compared with. */}
      {instruction.kind === 'waitVehicle' && (
        <View style={styles.direction}>
          <Icon name="arrow_forward" size={22} color={colors.ink} />
          <StationName name={instruction.leg.direction} variant="direction" color={colors.ink} />
        </View>
      )}
      {/* Where to get on, where to get off: the same marks as in the summary (E08). */}
      {instruction.kind === 'reachStop' && (
        <View style={styles.direction}>
          <Icon name="login" size={22} color={colors.emerald} variant="outlined" />
          <StationName name={instruction.leg.from} variant="instruction" color={colors.ink} />
        </View>
      )}
      {(instruction.kind === 'ride' || instruction.kind === 'getOffSoon') && (
        <View style={styles.direction}>
          <Icon
            name="logout"
            size={22}
            color={alert ? colors.alert : colors.emerald}
            variant="outlined"
          />
          <StationName name={instruction.leg.to} variant="instruction" color={colors.ink} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 104,
    borderRadius: radii.sheet,
    borderWidth: 3,
    padding: 12,
    gap: 10,
    boxShadow: shadows.float,
  },
  onTrack: {
    backgroundColor: colors.warmWhite,
    borderColor: colors.onTrack,
  },
  alert: {
    backgroundColor: colors.alertSoft,
    borderColor: colors.alert,
  },
  plainTile: {
    backgroundColor: colors.surfaceLow,
  },
  alertTile: {
    backgroundColor: colors.white,
  },
  tile: {
    width: 80,
    height: 80,
    borderRadius: TILE_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bareTile: {
    backgroundColor: 'transparent',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  spacer: {
    flex: 1,
  },
  offRoute: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Inside the card, so a touch on the hand itself is a touch on the card.
  touchHint: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: 4,
    borderRadius: 999,
    backgroundColor: colors.white,
    boxShadow: shadows.warm,
  },
  direction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  // « Then »: smaller and paler, no arrow (spec 006, reading direction).
  next: {
    width: 56,
    height: 56,
    borderRadius: radii.control,
    opacity: 0.7,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
