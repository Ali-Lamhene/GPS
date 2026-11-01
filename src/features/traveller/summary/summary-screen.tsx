import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { totalMinutes } from '@/domain/trip';
import { FloatingSheet } from '@/ui/components/floating-sheet';
import { HelpButton } from '@/ui/components/help-button';
import { IconButton } from '@/ui/components/icon-button';
import { MainActionButton } from '@/ui/components/main-action-button';
import { MapHeader } from '@/ui/components/map-header';
import { TimeDials } from '@/ui/components/time-dials';
import { colors } from '@/ui/theme';

import { TripEnds } from '../components/trip-ends';
import { TripOverviewMap } from '../components/trip-overview-map';
import { DEMO_LEGS } from '../demo/trips';
import { useGoHome } from '../hooks/use-go-home';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import { LegRow } from './leg-row';

/**
 * E07 summary over the trip map, E08 once a leg is opened: the map then frames that leg.
 * The bar starts the guidance.
 */
export function SummaryScreen() {
  const { origin, destination, mode, dispatch } = useTripPlan();
  const goHome = useGoHome();
  const [openLeg, setOpenLeg] = useState<number | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(0);
  const legs = DEMO_LEGS[mode];

  return (
    <View style={styles.screen}>
      <TripOverviewMap
        legs={legs}
        origin={origin}
        destination={destination}
        top={headerHeight}
        bottom={sheetHeight}
        focusLeg={openLeg ?? undefined}
      />
      <MapHeader
        onHeight={setHeaderHeight}
        left={<IconButton icon="home" label="Accueil" tone="raised" onPress={goHome} />}
        center={<TripEnds origin={origin} destination={destination} size="sm" />}
        right={<HelpButton onPress={() => router.push('/help')} />}
      />
      <FloatingSheet onHeight={setSheetHeight} gap={12}>
        <ScrollView style={styles.legs} contentContainerStyle={styles.legsContent}>
          {legs.map((leg, i) => (
            <LegRow
              key={i}
              leg={leg}
              first={i === 0}
              open={openLeg === i}
              onPress={() => setOpenLeg(openLeg === i ? null : i)}
            />
          ))}
        </ScrollView>
        <View style={styles.footer}>
          <TimeDials minutes={totalMinutes(legs)} size={56} crossColor={colors.white} gap={6} />
          <View style={styles.start}>
            <MainActionButton
              icon="navigation"
              label="Démarrer le trajet"
              shape="bar"
              onPress={() => {
                dispatch({ type: 'goToStep', index: 0 });
                router.push('/guidance');
              }}
            />
          </View>
        </View>
      </FloatingSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.mapGround,
  },
  legs: {
    maxHeight: 290,
    backgroundColor: colors.surfaceLow,
    borderRadius: 16,
  },
  legsContent: {
    paddingVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  start: {
    flex: 1,
  },
});
