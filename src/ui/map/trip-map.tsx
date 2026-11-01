import { StyleSheet, View } from 'react-native';

import { colors } from '@/ui/theme';

import type { TripMapProps } from './trip-map-types';

/** Whether a real map is drawn on this platform; screens skip optional maps otherwise. */
export const MAP_RENDERS = false;

/**
 * Phone version: plain ground until MapLibre native is added, after the browser preview
 * screens of spec 002 are validated. The web version lives in trip-map.web.tsx.
 */
export function TripMap(_props: TripMapProps) {
  return <View style={[StyleSheet.absoluteFill, styles.ground]} />;
}

const styles = StyleSheet.create({
  ground: {
    backgroundColor: colors.mapGround,
  },
});
