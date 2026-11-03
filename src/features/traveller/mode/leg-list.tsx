import { I18nManager, StyleSheet, View } from 'react-native';

import { isTransitLeg, type Leg } from '@/domain/trip';
import { Icon } from '@/ui/icon/icon';
import { colors, radii, spacing } from '@/ui/theme';

import { legIcon } from '../components/leg-style';
import { LineBadge, MetroSign } from '../components/line-badge';

const DISC = 40;

/**
 * The legs of the trip as a row of round marks joined by short lines (spec 010), each
 * vehicle with its line id below. A small pin starts it and a small flag ends it, so it
 * reads the same in both directions (spec 006); it is never mirrored.
 */
export function LegList({ legs }: { legs: readonly Leg[] }) {
  return (
    <View style={[styles.frieze, I18nManager.isRTL && styles.unmirrored]}>
      <Icon name="location_on" size={20} color={colors.emerald} variant="outlined" />
      {legs.map((leg, i) => (
        <View key={i} style={[styles.step, I18nManager.isRTL && styles.unmirrored]}>
          <View style={styles.link} />
          <View style={styles.mark}>
            <View style={styles.disc}>
              {/* The official « M », as on the map and in the guidance. */}
              {leg.kind === 'metro' ? (
                <MetroSign color={leg.line.color} size={26} />
              ) : (
                <Icon name={legIcon(leg)} size={22} color={colors.emerald} variant="outlined" />
              )}
            </View>
            <View style={styles.badge}>
              {isTransitLeg(leg) && <LineBadge line={leg.line} size="sm" />}
            </View>
          </View>
        </View>
      ))}
      <View style={styles.link} />
      <Icon name="flag" size={20} color={colors.emerald} variant="outlined" />
    </View>
  );
}

const styles = StyleSheet.create({
  frieze: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.control,
    backgroundColor: colors.surfaceLow,
  },
  unmirrored: {
    // In a right-to-left layout, 'row-reverse' lays the row out left to right again.
    flexDirection: 'row-reverse',
  },
  step: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  link: {
    flex: 1,
    height: 2,
    marginTop: 10,
    backgroundColor: colors.emeraldHalo,
  },
  mark: {
    alignItems: 'center',
    gap: 4,
    marginTop: -(DISC - 20) / 2,
  },
  disc: {
    width: DISC,
    height: DISC,
    borderRadius: DISC / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    minHeight: 28,
  },
});
