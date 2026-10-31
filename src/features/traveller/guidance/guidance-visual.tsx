import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import type { GuidanceVisual as Visual } from '@/domain/guidance';
import type { Place } from '@/domain/place';
import { PHOTOS } from '@/ui/photos';
import { colors } from '@/ui/theme';

import { GuidanceMap } from './guidance-map';

type GuidanceVisualProps = {
  visual: Visual;
  destination?: Place;
};

/** Middle of the guidance screen: the drawn map on foot, a photo of the place otherwise. */
export function GuidanceVisual({ visual, destination }: GuidanceVisualProps) {
  return (
    <View style={styles.pane}>
      {visual.kind === 'photo' ? (
        <Image
          source={PHOTOS[visual.photo]}
          contentFit="cover"
          contentPosition={{ left: `${visual.focus.x}%`, top: `${visual.focus.y}%` }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <GuidanceMap
          route={visual.route}
          markerIcon={
            visual.marker === 'stop'
              ? 'directions_bus'
              : visual.marker === 'destination'
                ? (destination?.icon ?? 'flag')
                : undefined
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pane: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
  },
});
