import { StyleSheet, View } from 'react-native';

import { colors } from '@/ui/theme';

import { useTravellerPosition } from '../location/location-context';

import { PermissionIntroScreen } from './permission-intro-screen';

/**
 * Spec 038: over the whole app while the position's explanation is up, whatever screen is
 * under it (the first start, or a touch on « here » crossed out). While the permission is
 * still being read, a plain cover keeps the home from showing for an instant first.
 */
export function PermissionIntroHost() {
  const { intro, answerIntro, checking } = useTravellerPosition();
  if (checking) return <View testID="permission-checking" style={styles.cover} />;
  if (!intro) return null;
  return (
    <PermissionIntroScreen
      kind="location"
      mode={intro}
      onAccept={() => answerIntro(true)}
      onSkip={() => answerIntro(false)}
    />
  );
}

const styles = StyleSheet.create({
  cover: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface,
  },
});
