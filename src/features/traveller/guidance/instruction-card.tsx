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
  /** Static mockup: touching the card simulates reaching the next step (D11). */
  onPress: () => void;
};

/**
 * Dark pill floating over the map (spec 008): the one thing to do now, very large; a turn
 * sits in a ring that empties as the corner comes closer. Orange to get off.
 */
export function InstructionCard({
  instruction,
  destination,
  approach,
  onPress,
}: InstructionCardProps) {
  const alert = isAlert(instruction);
  const symbol = mainSymbol(instruction);
  const next = nextSymbol(instruction, destination);
  const leg = 'leg' in instruction ? instruction.leg : undefined;
  const turn = instruction.kind === 'walk' && instruction.turn !== 'straight';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Étape suivante"
      onPress={onPress}
      style={[styles.card, { backgroundColor: alert ? colors.alert : colors.ink }]}
    >
      <View style={styles.top}>
        {turn && symbol !== 'metro' ? (
          <TurnGauge turn={symbol} left={approach ?? 1} />
        ) : (
          <View
            style={[
              styles.tile,
              symbol === 'metro'
                ? styles.bareTile
                : { backgroundColor: alert ? colors.white : colors.whiteGlass },
            ]}
          >
            {alert && <PulseRing borderRadius={TILE_RADIUS} color={colors.white} />}
            {symbol === 'metro' && leg ? (
              <MetroSign color={leg.line.color} size={60} />
            ) : symbol !== 'metro' ? (
              <Icon name={symbol} size={50} color={alert ? colors.alert : colors.white} />
            ) : null}
          </View>
        )}
        {instruction.kind === 'waitVehicle' && <LineBadge line={instruction.leg.line} size="lg" />}
        <View style={styles.spacer} />
        {next && (
          <View style={styles.next}>
            <Icon name={next} size={30} color={colors.white} />
          </View>
        )}
      </View>
      {/* Names take the whole width, so they break like the sign they are compared with. */}
      {instruction.kind === 'waitVehicle' && (
        <View style={styles.direction}>
          <Icon name="arrow_forward" size={22} color={colors.white} />
          <StationName name={instruction.leg.direction} variant="direction" color={colors.white} />
        </View>
      )}
      {instruction.kind === 'reachStop' && (
        <StationName name={instruction.leg.from} variant="instruction" color={colors.white} />
      )}
      {(instruction.kind === 'ride' || instruction.kind === 'getOffSoon') && (
        <StationName name={instruction.leg.to} variant="instruction" color={colors.white} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 104,
    borderRadius: radii.sheet,
    padding: 14,
    gap: 10,
    boxShadow: shadows.float,
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
    opacity: 0.8,
    backgroundColor: colors.whiteGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
