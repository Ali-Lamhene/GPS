import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { StreetPhoto } from '@/domain/street-photo';

/** Width of the slice of a 360° panorama that is shown, in degrees. */
const SLICE_DEGREES = 90;

type StreetPhotoViewProps = {
  photo: StreetPhoto;
};

/**
 * A street photo of the arrival (spec 030), filling its parent, which sets the size, the
 * shape and `overflow: 'hidden'`. A flat picture is cropped around the place; a 360°
 * panorama shows the quarter that faces the place, the horizon in the middle.
 */
export function StreetPhotoView({ photo }: StreetPhotoViewProps) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const source = { uri: photo.url };
  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(event) => setSize(event.nativeEvent.layout)}
      // Decorative for a screen reader: the disc or card around it carries the label.
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {size && !photo.panorama && (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition={{ left: `${Math.round(photo.centre * 100)}%`, top: '50%' }}
          cachePolicy="memory"
        />
      )}
      {size &&
        photo.panorama &&
        // The slice may cross the panorama's seam: a second copy, one turn away, fills it.
        [-1, 0, 1].map((turn) => {
          const width = (size.width * 360) / SLICE_DEGREES;
          const height = width / 2;
          const left = size.width / 2 - (photo.centre + turn) * width;
          return (
            <Image
              key={turn}
              source={source}
              style={{
                position: 'absolute',
                width,
                height,
                left,
                top: size.height / 2 - height / 2,
              }}
              contentFit="fill"
              cachePolicy="memory"
            />
          );
        })}
    </View>
  );
}
