import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HelpButton } from '@/ui/components/help-button';
import { IconButton } from '@/ui/components/icon-button';
import { MapHeader } from '@/ui/components/map-header';
import { MainActionButton } from '@/ui/components/main-action-button';
import { PulseRing } from '@/ui/components/pulse-ring';
import { Icon } from '@/ui/icon/icon';
import { colors, shadows } from '@/ui/theme';

import { TripMap } from '@/ui/map/trip-map';

import { DEMO_CURRENT_POSITION } from '../demo/trips';
import { usePlaceDraft } from './use-place-draft';

/**
 * E27: the current position on the real map, to be saved as a new place. The demo position
 * stands in for GPS until spec 001 (D11).
 */
export function PositionScreen() {
  const insets = useSafeAreaInsets();
  const { cancel } = usePlaceDraft();

  return (
    <View style={styles.screen}>
      <TripMap camera={{ center: DEMO_CURRENT_POSITION, zoom: 17.5 }} interactive={false} />
      <View style={styles.center}>
        <View style={styles.accuracy} />
        <View style={styles.dotBox}>
          <PulseRing borderRadius={18} />
          <View style={styles.dot} />
        </View>
        <View style={styles.pin}>
          <Icon name="add_location_alt" size={48} color={colors.primary} />
        </View>
      </View>
      <MapHeader
        left={<IconButton icon="close" label="Annuler" onPress={cancel} tone="raised" />}
        right={<HelpButton onPress={() => router.push('/help')} />}
      />
      <View style={[styles.action, { bottom: insets.bottom + 28 }]}>
        <MainActionButton
          icon="check"
          label="Enregistrer cette position"
          onPress={() => router.push('/add-place/pictogram')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.mapGround,
  },
  center: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    alignItems: 'center',
  },
  accuracy: {
    position: 'absolute',
    top: -110,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.accuracy,
    borderWidth: 1,
    borderColor: colors.accuracyEdge,
  },
  dotBox: {
    position: 'absolute',
    top: -18,
    width: 36,
    height: 36,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    borderWidth: 5,
    borderColor: colors.white,
    boxShadow: shadows.marker,
  },
  pin: {
    position: 'absolute',
    top: -124,
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.floating,
  },
  action: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
