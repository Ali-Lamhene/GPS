import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { FloatingSheet } from '@/ui/components/floating-sheet';
import { HelpButton } from '@/ui/components/help-button';
import { MainActionButton } from '@/ui/components/main-action-button';
import { MapHeader } from '@/ui/components/map-header';
import { PlaceArt } from '@/ui/components/place-art';
import { Icon } from '@/ui/icon/icon';
import { TripMap } from '@/ui/map/trip-map';
import { colors, radii } from '@/ui/theme';

import { DEMO_LEGS } from '../demo/trips';
import { useCueOnEnter } from '../hooks/use-cue-on-enter';
import { useGoHome } from '../hooks/use-go-home';
import { useTripPlan } from '../trip-plan/trip-plan-context';

const SEAL = 72;

/**
 * E26: arrived. The map shows the traveller at the destination pin; the card shows the
 * place reached in large (photo, or colour and pictogram) and a green seal that pops in,
 * with its own sound and vibration (spec 008).
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
        {/* The place reached is the hero: its photo, or its colour and pictogram (spec 008). */}
        <View style={styles.place}>
          <View style={styles.clip}>
            {destination ? (
              <PlaceArt
                place={destination}
                iconSize={96}
                faded={260}
                badgeSize={56}
                veil
                showPhoto
              />
            ) : (
              <View style={styles.flag}>
                <Icon name="flag" size={96} color={colors.white} />
              </View>
            )}
          </View>
          <Animated.View entering={ZoomIn.delay(300).springify().damping(9)} style={styles.seal}>
            <Icon name="check" size={46} color={colors.white} />
          </Animated.View>
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
  place: {
    height: 240,
  },
  clip: {
    ...StyleSheet.absoluteFill,
    borderRadius: radii.placeCard,
    overflow: 'hidden',
  },
  flag: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  seal: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: SEAL,
    height: SEAL,
    borderRadius: SEAL / 2,
    borderWidth: 4,
    borderColor: colors.white,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 18px rgba(46,125,79,.45)',
  },
});
