import { StyleSheet, View } from 'react-native';

import { colors } from '@/ui/theme';

/** The small bar at the top of a bottom panel. */
export function GrabHandle() {
  return <View style={styles.handle} />;
}

const styles = StyleSheet.create({
  handle: {
    alignSelf: 'center',
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.handle,
  },
});
