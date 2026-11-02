import { StyleSheet, View } from 'react-native';

import { isTransitLeg, type Leg } from '@/domain/trip';
import { TimeDials } from '@/ui/components/time-dials';
import { Icon } from '@/ui/icon/icon';
import { colors, radii } from '@/ui/theme';

import { legColor, legIcon } from '../components/leg-style';
import { LineBadge } from '../components/line-badge';

function Rail({ leg }: { leg: Leg }) {
  if (leg.kind === 'walk') return <View style={styles.walkRail} />;
  return <View style={[styles.vehicleRail, { backgroundColor: legColor(leg) }]} />;
}

/** The legs of the trip, one compact line each, with their duration dials. */
export function LegList({ legs }: { legs: readonly Leg[] }) {
  return (
    <View style={styles.list}>
      {legs.map((leg, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.railBox}>
            <Rail leg={leg} />
          </View>
          <Icon name={legIcon(leg)} size={24} style={styles.icon} />
          {isTransitLeg(leg) && <LineBadge line={leg.line} size="sm" />}
          <View style={styles.spacer} />
          <TimeDials minutes={leg.minutes} size={32} crossColor={colors.surfaceLow} gap={6} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.control,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 36,
  },
  railBox: {
    width: 16,
    height: 36,
  },
  walkRail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 6,
    borderLeftWidth: 4,
    borderStyle: 'dotted',
    borderColor: colors.walkRail,
  },
  vehicleRail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 5,
    width: 6,
    borderRadius: 3,
  },
  icon: {
    width: 28,
  },
  spacer: {
    flex: 1,
  },
});
