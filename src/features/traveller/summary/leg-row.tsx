import { Pressable, StyleSheet, View } from 'react-native';

import { isTransitLeg, type Leg } from '@/domain/trip';
import { TimeDials } from '@/ui/components/time-dials';
import { Icon } from '@/ui/icon/icon';
import { colors, radii } from '@/ui/theme';

import { legIcon } from '../components/leg-style';
import { LineBadge, MetroSign } from '../components/line-badge';
import { LegDetails } from './leg-details';

type LegRowProps = {
  leg: Leg;
  open: boolean;
  onPress: () => void;
};

/** One leg of the summary; touching its header opens its details (E08). */
export function LegRow({ leg, open, onPress }: LegRowProps) {
  // Closed rows are warm white; the open one turns pale emerald (spec 010).
  const background = open ? colors.accentSoft : colors.warmWhite;
  return (
    <View style={[styles.row, { backgroundColor: background }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onPress}
        style={styles.header}
      >
        <View style={styles.badge}>
          {/* The official « M », as on the map and in the guidance. */}
          {leg.kind === 'metro' ? (
            <MetroSign color={leg.line.color} size={28} />
          ) : (
            <Icon name={legIcon(leg)} size={26} color={colors.emerald} variant="outlined" />
          )}
        </View>
        {isTransitLeg(leg) && <LineBadge line={leg.line} size="md" />}
        <View style={styles.spacer} />
        <TimeDials minutes={leg.minutes} size={36} crossColor={background} gap={6} />
        <Icon
          name={open ? 'expand_less' : 'expand_more'}
          size={26}
          color={colors.emerald}
          variant="outlined"
        />
      </Pressable>
      {open && <LegDetails leg={leg} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.warmEdge,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
});
