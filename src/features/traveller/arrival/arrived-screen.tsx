import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { isLocalPicture } from '@/domain/place';
import { FloatingSheet } from '@/ui/components/floating-sheet';
import { HelpButton } from '@/ui/components/help-button';
import { MainActionButton } from '@/ui/components/main-action-button';
import { MapHeader } from '@/ui/components/map-header';
import { PulseRing } from '@/ui/components/pulse-ring';
import { Icon } from '@/ui/icon/icon';
import { TripMap } from '@/ui/map/trip-map';
import { colors, radii } from '@/ui/theme';

import { DEMO_LEGS } from '../demo/trips';
import { useCueOnEnter } from '../hooks/use-cue-on-enter';
import { useGoHome } from '../hooks/use-go-home';
import { useTripPlan } from '../trip-plan/trip-plan-context';

const SEAL = 72;

/**
 * E26: arrived. The map shows the traveller at the destination pin; the sheet shows the
 * destination photo or pictogram with a green seal, with its own sound and vibration.
 */
export function ArrivedScreen() {
  const { destination, mode } = useTripPlan();
  const goHome = useGoHome();
  useCueOnEnter('arrival');
  const end = DEMO_LEGS[mode].at(-1)?.path.at(-1);
  const icon = destination?.icon ?? 'flag';
  const photo =
    destination?.photo && isLocalPicture(destination.photo) ? destination.photo : undefined;
  const [sheetHeight, setSheetHeight] = useState(280);

  return (
    <View style={styles.screen}>
      {end && (
        <TripMap
          camera={{ center: end, zoom: 17.2, padding: { top: 0, bottom: sheetHeight } }}
          traveller={{ point: end }}
          destination={{ point: end, icon }}
          controlsBottom={sheetHeight + 8}
        />
      )}
      <MapHeader right={<HelpButton onPress={() => router.push('/help')} />} />
      <FloatingSheet gap={32} onHeight={setSheetHeight}>
        <View style={styles.center}>
          <View style={styles.place}>
            {/* The traveller's own photo of the door is the best "this is it" (screens.md). */}
            {photo ? (
              <Image
                source={{ uri: photo }}
                contentFit="cover"
                style={[StyleSheet.absoluteFill, styles.photo]}
              />
            ) : (
              <Icon name={icon} size={66} color={colors.white} />
            )}
            <View style={styles.sealBox}>
              <PulseRing borderRadius={SEAL / 2} color={colors.success} />
              <View style={styles.seal}>
                <Icon name="check" size={44} color={colors.white} variant="outlined" />
              </View>
            </View>
          </View>
        </View>
        <MainActionButton icon="home" label="Accueil" onPress={goHome} />
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
    paddingTop: 8,
  },
  place: {
    width: 148,
    height: 148,
    borderRadius: radii.control,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 18px rgba(47,107,255,.35)',
  },
  photo: {
    borderRadius: radii.control,
  },
  sealBox: {
    position: 'absolute',
    right: -16,
    bottom: -16,
    width: SEAL,
    height: SEAL,
  },
  seal: {
    width: SEAL,
    height: SEAL,
    borderRadius: SEAL / 2,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 0 5px ${colors.white}`,
  },
});
