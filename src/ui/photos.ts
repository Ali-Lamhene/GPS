import type { ImageSource } from 'expo-image';

import type { PhotoId } from '@/domain/photo';

// Photos bundled with the app, resized to 720 × 1080 JPEG without metadata.
export const PHOTOS: Record<PhotoId, ImageSource> = {
  busStop: require('../../assets/photos/bus-stop.jpg'),
  busExit: require('../../assets/photos/bus-exit.jpg'),
  busInterior: require('../../assets/photos/bus-interior.jpg'),
  metroEntrance: require('../../assets/photos/metro-entrance.jpg'),
  metroPlatform: require('../../assets/photos/metro-platform.jpg'),
  metroInteriorBlue: require('../../assets/photos/metro-interior-blue.jpg'),
  metroInteriorYellow: require('../../assets/photos/metro-interior-yellow.jpg'),
  tramStop: require('../../assets/photos/tram-stop.jpg'),
};
