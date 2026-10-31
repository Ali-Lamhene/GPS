import { StyleSheet, View } from 'react-native';

import type { Place } from '@/domain/place';
import { Icon } from '@/ui/icon/icon';
import { colors } from '@/ui/theme';

const SIZES = {
  sm: { box: 40, icon: 24, radius: 8 },
  md: { box: 44, icon: 26, radius: 14 },
} as const;

type TripEndsProps = {
  origin?: Place;
  destination?: Place;
  size: keyof typeof SIZES;
};

/** Reminder of the trip being prepared: start pictogram → arrival pictogram. */
export function TripEnds({ origin, destination, size }: TripEndsProps) {
  const { box, icon, radius } = SIZES[size];
  const frame = { minWidth: box, height: box, borderRadius: radius };
  return (
    <View style={styles.row}>
      <View style={[styles.box, styles.origin, frame]}>
        <Icon name={origin?.icon ?? 'trip_origin'} size={icon} />
      </View>
      <Icon name="arrow_forward" size={22} color={colors.outline} variant="outlined" />
      <View style={[styles.box, styles.destination, frame]}>
        <Icon name={destination?.icon ?? 'flag'} size={icon} color={colors.white} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  box: {
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  origin: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
  },
  destination: {
    backgroundColor: colors.ink,
  },
});
