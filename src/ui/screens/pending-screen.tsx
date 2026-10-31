import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/ui/components/icon-button';
import { colors } from '@/ui/theme';

/** Placeholder for a route whose screen is not built yet: an empty page with a way back. */
export function PendingScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 20 }]}>
      <IconButton icon="arrow_back" label="Retour" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
  },
});
