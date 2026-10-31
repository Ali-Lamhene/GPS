import { Pressable, StyleSheet, View } from 'react-native';

import type { Place } from '@/domain/place';
import { isAlert, type Instruction } from '@/domain/guidance';
import { PulseRing } from '@/ui/components/pulse-ring';
import { Icon } from '@/ui/icon/icon';
import { colors, shadows } from '@/ui/theme';

import { LineBadge, MetroSign } from '../components/line-badge';
import { StationName } from '../components/station-name';
import { mainSymbol, nextSymbol } from './instruction-look';

const TILE_RADIUS = 24;

type InstructionCardProps = {
  instruction: Instruction;
  destination?: Place;
  /** Static mockup: touching the card simulates reaching the next step (D11). */
  onPress: () => void;
};

/** The one thing to do now: green while all is well, orange to get off. */
export function InstructionCard({ instruction, destination, onPress }: InstructionCardProps) {
  const alert = isAlert(instruction);
  const symbol = mainSymbol(instruction);
  const next = nextSymbol(instruction, destination);
  const leg = 'leg' in instruction ? instruction.leg : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Étape suivante"
      onPress={onPress}
      style={[styles.card, { backgroundColor: alert ? colors.alert : colors.guidance }]}
    >
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
          <MetroSign color={leg.line.color} size={100} />
        ) : symbol !== 'metro' ? (
          <Icon name={symbol} size={104} color={alert ? colors.alert : colors.white} />
        ) : null}
      </View>
      <View style={styles.details}>
        {instruction.kind === 'waitVehicle' && (
          <>
            <LineBadge line={instruction.leg.line} size="xl" />
            <View style={styles.direction}>
              <Icon name="arrow_forward" size={24} color={colors.white} />
              <StationName
                name={instruction.leg.direction}
                variant="direction"
                color={colors.white}
              />
            </View>
          </>
        )}
        {instruction.kind === 'reachStop' && (
          <StationName name={instruction.leg.from} variant="instruction" color={colors.white} />
        )}
        {(instruction.kind === 'ride' || instruction.kind === 'getOffSoon') && (
          <StationName name={instruction.leg.to} variant="instruction" color={colors.white} />
        )}
        {next && (
          <View style={styles.next}>
            <Icon name={next} size={44} color={colors.white} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 148,
    borderRadius: 28,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    boxShadow: shadows.card,
  },
  tile: {
    width: 110,
    height: 110,
    borderRadius: TILE_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bareTile: {
    backgroundColor: 'transparent',
  },
  details: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 10,
  },
  direction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  next: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.whiteGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
