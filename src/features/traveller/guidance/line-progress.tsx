import { StyleSheet, View } from 'react-native';

import type { TransitLeg } from '@/domain/trip';
import { Icon } from '@/ui/icon/icon';
import { colors } from '@/ui/theme';

import { StationName } from '../components/station-name';

type LineProgressProps = {
  leg: TransitLeg;
  /** From 0 (just left `from`) to 1 (at `to`). */
  fraction: number;
};

/**
 * The line as a vertical strip of stations, the traveller between two of them, and the
 * station to get off at marked: works without network and lets the traveller count stops.
 */
export function LineProgress({ leg, fraction }: LineProgressProps) {
  const stations = [leg.from, ...leg.via, leg.to];
  const gaps = stations.length - 1;
  const position = Math.min(gaps, Math.max(0, fraction * gaps));
  // Many stops: the ones in between become nameless dots, so the exit stays on screen and
  // the stops can still be counted.
  const named = (i: number) => i === 0 || i === gaps || leg.via.length <= 3;

  return (
    <View style={styles.list}>
      {stations.map((name, i) => {
        const last = i === stations.length - 1;
        const passed = i <= Math.floor(position) && !last;
        const here = Math.floor(position) === i && (!last || position === gaps);
        return (
          <View key={name} style={[styles.station, !named(i) && styles.compact]}>
            <View style={styles.rail}>
              {i > 0 && (
                <View
                  style={[
                    styles.segment,
                    { backgroundColor: leg.line.color },
                    i <= position && styles.passed,
                  ]}
                />
              )}
              <View
                style={[
                  styles.dot,
                  { borderColor: leg.line.color },
                  last && styles.exit,
                  passed && styles.passed,
                ]}
              >
                {last && <Icon name="logout" size={20} color={colors.white} variant="outlined" />}
              </View>
              {!last && (
                <View
                  style={[
                    styles.segment,
                    { backgroundColor: leg.line.color },
                    i < Math.floor(position) && styles.passed,
                  ]}
                />
              )}
              {here && (
                <View style={[styles.traveller, { top: `${50 + (position - i) * 100}%` }]} />
              )}
            </View>
            {named(i) && (
              <StationName
                name={name}
                variant={last ? 'large' : 'row'}
                color={last ? colors.night.ink : colors.night.inkMuted}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const ROW = 72;

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 8,
  },
  station: {
    height: ROW,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  compact: {
    height: ROW / 2,
  },
  rail: {
    width: 44,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    width: 8,
    flex: 1,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 5,
    backgroundColor: colors.night.background,
  },
  passed: {
    opacity: 0.45,
  },
  exit: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0,
    backgroundColor: colors.alert,
    alignItems: 'center',
    justifyContent: 'center',
  },
  traveller: {
    position: 'absolute',
    width: 26,
    height: 26,
    marginTop: -13,
    borderRadius: 13,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.white,
  },
});
