import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { totalMinutes } from '@/domain/trip';
import { HelpButton } from '@/ui/components/help-button';
import { IconButton } from '@/ui/components/icon-button';
import { MainActionButton } from '@/ui/components/main-action-button';
import { ScreenFrame } from '@/ui/components/screen-frame';
import { TimeDials } from '@/ui/components/time-dials';
import { colors } from '@/ui/theme';

import { TripEnds } from '../components/trip-ends';
import { DEMO_LEGS } from '../demo/trips';
import { useGoHome } from '../hooks/use-go-home';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import { LegRow } from './leg-row';

/** E07 summary of the trip, E08 once a leg is opened. The disc starts the guidance. */
export function SummaryScreen() {
  const { origin, destination, mode, dispatch } = useTripPlan();
  const goHome = useGoHome();
  const [openLeg, setOpenLeg] = useState<number | null>(null);
  const legs = DEMO_LEGS[mode];

  return (
    <ScreenFrame
      gap={14}
      action={
        <MainActionButton
          icon="navigation"
          label="Démarrer le trajet"
          onPress={() => {
            dispatch({ type: 'goToStep', index: 0 });
            router.push('/guidance');
          }}
        />
      }
    >
      <View style={styles.header}>
        <IconButton icon="home" label="Accueil" onPress={goHome} />
        <HelpButton onPress={() => router.push('/help')} />
      </View>
      <View style={styles.total}>
        <TripEnds origin={origin} destination={destination} size="md" />
        <View style={styles.spacer} />
        <TimeDials minutes={totalMinutes(legs)} size={52} crossColor={colors.surfaceContainer} />
      </View>
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
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  total: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  spacer: {
    flex: 1,
  },
  legs: {
    flex: 1,
    backgroundColor: colors.surfaceLow,
    borderRadius: 28,
  },
  legsContent: {
    paddingVertical: 8,
  },
});
