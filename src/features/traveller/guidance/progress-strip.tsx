import { StyleSheet, View } from 'react-native';

import type { Leg } from '@/domain/trip';
import { colors } from '@/ui/theme';

import { legColor } from '../components/leg-style';

type ProgressStripProps = {
  legs: readonly Leg[];
  /** From 0 to 1 along the whole trip. */
  progress: number;
};

/** The trip as coloured segments, with the traveller's position on it. */
export function ProgressStrip({ legs, progress }: ProgressStripProps) {
  return (
    <View style={styles.strip}>
      {legs.map((leg, i) => (
        <View
          key={i}
          style={[styles.segment, { flexGrow: leg.minutes, backgroundColor: legColor(leg) }]}
        />
      ))}
      <View style={[styles.marker, { left: `${progress * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flex: 1,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  segment: {
    flexBasis: 0,
    flexShrink: 1,
    height: 10,
    borderRadius: 5,
  },
  marker: {
    position: 'absolute',
    top: 1,
    width: 22,
    height: 22,
    marginLeft: -11,
    borderRadius: 11,
    backgroundColor: colors.white,
    borderWidth: 5,
    borderColor: colors.ink,
    boxShadow: '0 1px 3px rgba(0,0,0,.3)',
  },
});
