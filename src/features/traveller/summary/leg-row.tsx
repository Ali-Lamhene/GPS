import { Pressable, StyleSheet, View } from 'react-native';

import { isTransitLeg, type Leg } from '@/domain/trip';
import { TimeDials } from '@/ui/components/time-dials';
import { Icon } from '@/ui/icon/icon';
import { colors, radii } from '@/ui/theme';

import { legIcon } from '../components/leg-style';
import { LineBadge } from '../components/line-badge';
import { LegDetails } from './leg-details';

type LegRowProps = {
  leg: Leg;
  open: boolean;
  onPress: () => void;
};

/** One leg of the summary; touching its header opens its details (E08). */
export function LegRow({ leg, open, onPress }: LegRowProps) {
  const background = open ? colors.accentSoft : colors.surfaceLow;
  return (
    <View style={[styles.row, { backgroundColor: background }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onPress}
        // The row padding stays touchable: the whole line is at least 64 dp high.
        hitSlop={{ top: 10, bottom: 10 }}
        style={styles.header}
      >
        <View style={[styles.badge, leg.kind !== 'walk' && styles.vehicle]}>
          <Icon
            name={legIcon(leg)}
            size={26}
            color={leg.kind === 'walk' ? colors.ink : colors.onPrimary}
          />
        </View>
        {isTransitLeg(leg) && <LineBadge line={leg.line} size="md" />}
        <View style={styles.spacer} />
        <TimeDials minutes={leg.minutes} size={36} crossColor={background} gap={6} />
        <Icon
          name={open ? 'expand_less' : 'chevron_right'}
          size={26}
          color={colors.inkMuted}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicle: {
    backgroundColor: colors.primary,
  },
  spacer: {
    flex: 1,
  },
});
