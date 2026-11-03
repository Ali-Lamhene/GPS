import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { isHiddenOnMap } from '@/domain/place';

import { FloatingSheet } from '@/ui/components/floating-sheet';
import { HelpButton } from '@/ui/components/help-button';
import { MainActionButton } from '@/ui/components/main-action-button';
import { MapHeader } from '@/ui/components/map-header';
import { PlaceFace } from '@/ui/components/place-face';
import { Icon } from '@/ui/icon/icon';
import { TripMap } from '@/ui/map/trip-map';
import { colors } from '@/ui/theme';

import { DEMO_LEGS } from '../demo/trips';
import { useCueOnEnter } from '../hooks/use-cue-on-enter';
import { useGoHome } from '../hooks/use-go-home';
import { useTripPlan } from '../trip-plan/trip-plan-context';

const SEAL = 58;
const HALO = 196;
const DISC = 156;

/**
 * E26: arrived. The map shows the traveller at the destination pin; the card shows the
 * place reached in large (photo, or emerald pictogram) and an emerald seal that pops in,
 * with its own sound and vibration (spec 010).
 */
export function ArrivedScreen() {
  const { destination, mode } = useTripPlan();
  const goHome = useGoHome();
  useCueOnEnter('arrival');
  const end = DEMO_LEGS[mode].at(-1)?.path.at(-1);
  const icon = destination?.icon ?? 'flag';
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
      <FloatingSheet gap={14} onHeight={setSheetHeight}>
        {/* The place reached is the hero (spec 010): its pictogram, or its photo unless it is
            private (home, family), in a large emerald-edged disc, then the seal. */}
        <View style={styles.hero}>
          <View style={styles.halo}>
            <View style={styles.disc}>
              {destination ? (
                <PlaceFace
                  place={destination}
                  iconSize={72}
                  showPhoto={!isHiddenOnMap(destination)}
                />
              ) : (
                <Icon name="flag" size={72} color={colors.emerald} variant="outlined" />
              )}
            </View>
            {/* A badge on the edge of the place, not a button: no shadow, no pill shape. */}
            <Animated.View entering={ZoomIn.delay(300).springify().damping(9)} style={styles.seal}>
              <Icon name="check" size={36} color={colors.white} />
            </Animated.View>
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
  hero: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
  },
  halo: {
    width: HALO,
    height: HALO,
    borderRadius: HALO / 2,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    width: DISC,
    height: DISC,
    borderRadius: DISC / 2,
    borderWidth: 3,
    borderColor: colors.emerald,
    backgroundColor: colors.warmWhite,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seal: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: SEAL,
    height: SEAL,
    borderRadius: SEAL / 2,
    borderWidth: 4,
    borderColor: colors.warmWhite,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
