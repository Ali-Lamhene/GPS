import { Redirect } from 'expo-router';

import { ScreenGallery } from '@/features/dev/screen-gallery';

export default function DevScreens() {
  // A route is reachable by deep link: this one exists only in development builds.
  if (!__DEV__) return <Redirect href="/" />;
  return <ScreenGallery />;
}
