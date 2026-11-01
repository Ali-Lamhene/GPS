import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FloatingSheet } from '@/ui/components/floating-sheet';
import { HelpButton } from '@/ui/components/help-button';
import { MainActionButton } from '@/ui/components/main-action-button';
import { MapHeader } from '@/ui/components/map-header';
import { Icon } from '@/ui/icon/icon';
import { TripMap } from '@/ui/map/trip-map';
import { colors } from '@/ui/theme';

import { DEMO_CURRENT_POSITION } from '../demo/trips';
import { useCueOnEnter } from '../hooks/use-cue-on-enter';

/**
 * E25: a new trip needs the network (D4) and there is none. The bundled map still shows
 * where the traveller is; the sheet offers a single move, retry (it goes back to try again).
 */
export function ConnectionErrorScreen() {
  useCueOnEnter('offline');
  const [sheetHeight, setSheetHeight] = useState(260);

  return (
    <View style={styles.screen}>
      <TripMap
        camera={{
          center: DEMO_CURRENT_POSITION,
          zoom: 16,
          padding: { top: 0, bottom: sheetHeight },
        }}
        traveller={{ point: DEMO_CURRENT_POSITION }}
        controlsBottom={sheetHeight + 8}
        backdrop
      />
      <MapHeader right={<HelpButton onPress={() => router.push('/help')} />} />
      <FloatingSheet gap={24} onHeight={setSheetHeight}>
        <View style={styles.center}>
          <View style={styles.symbol}>
            {/* Same no-network sign as underground (E21): not every traveller has Wi-Fi. */}
            <Icon name="cloud_off" size={64} color={colors.error} variant="outlined" />
          </View>
        </View>
        <MainActionButton
          icon="refresh"
          label="Réessayer"
          shape="bar"
          onPress={() => router.back()}
        />
      </FloatingSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.mapGround,
  },
  center: {
    alignItems: 'center',
  },
  symbol: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
