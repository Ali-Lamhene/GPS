import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { totalMinutes, type TravelMode } from '@/domain/trip';
import { playCue } from '@/services/feedback';
import { HelpButton } from '@/ui/components/help-button';
import { IconButton } from '@/ui/components/icon-button';
import { MainActionButton } from '@/ui/components/main-action-button';
import { ScreenFrame } from '@/ui/components/screen-frame';
import { TimeDials } from '@/ui/components/time-dials';
import { colors } from '@/ui/theme';

import { TripEnds } from '../components/trip-ends';
import { DEMO_LEGS } from '../demo/trips';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import { LegList } from './leg-list';
import { ModeSelector } from './mode-selector';

/** E06: choose how to travel; the total time and the legs follow the choice. */
export function ModeScreen() {
  const { origin, destination, mode, dispatch } = useTripPlan();
  const legs = DEMO_LEGS[mode];

  const choose = (next: TravelMode) => {
    dispatch({ type: 'chooseMode', mode: next });
    playCue('select');
  };

  return (
    <ScreenFrame
      action={
        <MainActionButton
          icon="arrow_forward"
          label="Continuer"
          onPress={() => router.push('/summary')}
        />
      }
    >
      <View style={styles.header}>
        <IconButton icon="arrow_back" label="Retour" onPress={() => router.back()} />
        <TripEnds origin={origin} destination={destination} size="sm" />
        <HelpButton onPress={() => router.push('/help')} />
      </View>
      <View style={styles.total}>
        <TimeDials minutes={totalMinutes(legs)} size={120} crossColor={colors.surfaceContainer} />
      </View>
      <ModeSelector selected={mode} onSelect={choose} />
      <LegList legs={legs} />
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  total: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 28,
    padding: 16,
    alignItems: 'center',
  },
});
