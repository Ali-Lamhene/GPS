import { StyleSheet, View } from 'react-native';

import type { Leg } from '@/domain/trip';
import { VividFill } from '@/ui/components/vivid-fill';
import { Icon, type IconName } from '@/ui/icon/icon';
import { colors } from '@/ui/theme';

import { legColor } from '../components/leg-style';

type ProgressStripProps = {
  legs: readonly Leg[];
  /** From 0 to 1 along the whole trip. */
  progress: number;
  destinationIcon: IconName;
};

/**
 * The trip as segments drawn like on the map (blue dots on foot, line colours otherwise),
 * the traveller as on the map, and the destination pictogram at the end.
 */
export function ProgressStrip({ legs, progress, destinationIcon }: ProgressStripProps) {
  return (
    <View style={styles.row}>
      <View style={styles.strip}>
        {legs.map((leg, i) =>
          leg.kind === 'walk' ? (
            <View key={i} style={[styles.segment, styles.walk, { flexGrow: leg.minutes }]} />
          ) : (
            <View
              key={i}
              style={[
                styles.segment,
                styles.vehicle,
                { flexGrow: leg.minutes, backgroundColor: legColor(leg) },
              ]}
            />
          ),
        )}
        <View style={[styles.traveller, { left: `${progress * 100}%` }]} />
      </View>
      <View style={styles.destination}>
        <VividFill icon={destinationIcon} />
        <Icon name={destinationIcon} size={20} color={colors.white} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  strip: {
    flex: 1,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  segment: {
    flexBasis: 0,
    flexShrink: 1,
  },
  walk: {
    height: 0,
    borderTopWidth: 6,
    borderStyle: 'dotted',
    borderColor: colors.primary,
  },
  vehicle: {
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.onSecondaryContainer,
  },
  traveller: {
    position: 'absolute',
    top: 3,
    width: 22,
    height: 22,
    marginLeft: -11,
    borderRadius: 11,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.white,
    boxShadow: `0 0 0 2px ${colors.onSecondaryContainer}`,
  },
  destination: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
