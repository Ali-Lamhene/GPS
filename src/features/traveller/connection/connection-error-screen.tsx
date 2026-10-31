import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HelpButton } from '@/ui/components/help-button';
import { IconButton } from '@/ui/components/icon-button';
import { Icon } from '@/ui/icon/icon';
import { colors, sizes } from '@/ui/theme';

import { useCueOnEnter } from '../hooks/use-cue-on-enter';

/** E25: a new trip needs the network (D4) and there is none. Retry, or go back. */
export function ConnectionErrorScreen() {
  const insets = useSafeAreaInsets();
  useCueOnEnter('offline');

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}
    >
      <View style={styles.header}>
        <IconButton icon="arrow_back" label="Retour" onPress={() => router.back()} />
        <HelpButton onPress={() => router.push('/help')} />
      </View>
      <View style={styles.center}>
        <View style={styles.symbol}>
          <Icon name="wifi_off" size={96} color={colors.error} variant="outlined" />
        </View>
      </View>
      <IconButton
        icon="refresh"
        label="Réessayer"
        onPress={() => router.back()}
        tone="primary"
        shape="square"
        size={sizes.mainAction}
        iconSize={44}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
  },
  header: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
