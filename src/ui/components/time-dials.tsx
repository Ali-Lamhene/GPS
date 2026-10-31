import { StyleSheet, View } from 'react-native';

import { dialFills } from '@/domain/duration';

import { TimeDial } from './time-dial';

type TimeDialsProps = {
  minutes: number;
  size: number;
  crossColor: string;
  gap?: number;
};

/** A duration, without digits: one dial per started hour (docs/screens.md, rule 7). */
export function TimeDials({ minutes, size, crossColor, gap = 10 }: TimeDialsProps) {
  return (
    <View style={[styles.row, { gap }]}>
      {dialFills(minutes).map((fill, i) => (
        <TimeDial key={i} fill={fill} size={size} crossColor={crossColor} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
