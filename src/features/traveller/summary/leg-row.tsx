import { Pressable, StyleSheet, View } from 'react-native';

import { isTransitLeg, type Leg } from '@/domain/trip';
import { TimeDials } from '@/ui/components/time-dials';
import { Icon } from '@/ui/icon/icon';
import { colors } from '@/ui/theme';

import { legIcon } from '../components/leg-style';
import { LineBadge } from '../components/line-badge';
import { LegDetails } from './leg-details';

type LegRowProps = {
  leg: Leg;
  open: boolean;
  first: boolean;
  onPress: () => void;
};

/** One leg of the summary; touching its header opens its details (E08). */
export function LegRow({ leg, open, first, onPress }: LegRowProps) {
  const background = open ? colors.secondaryContainer : colors.surfaceLow;
  return (
    <View style={[styles.row, !first && styles.divider, open && { backgroundColor: background }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onPress}
        style={styles.header}
      >
        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                leg.kind === 'walk' ? colors.surfaceHighest : colors.secondaryContainer,
            },
          ]}
        >
          <Icon name={legIcon(leg)} size={28} />
        </View>
        {isTransitLeg(leg) && <LineBadge line={leg.line} size="md" />}
        <View style={styles.spacer} />
        <TimeDials minutes={leg.minutes} size={40} crossColor={background} gap={6} />
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
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
});
