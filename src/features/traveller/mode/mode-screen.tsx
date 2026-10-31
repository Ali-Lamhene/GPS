import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { totalMinutes, type TravelMode } from '@/domain/trip';
import { playCue } from '@/services/feedback';
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
import { useTripPlan } from '../trip-plan/trip-plan-context';
import { LegList } from './leg-list';
import { ModeSelector } from './mode-selector';

/** E06 (spec 002): the trip drawn on the map; choosing how to travel redraws it. */
export function ModeScreen() {
  const { origin, destination, mode, dispatch } = useTripPlan();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(0);
  const legs = DEMO_LEGS[mode];

  const choose = (next: TravelMode) => {
    dispatch({ type: 'chooseMode', mode: next });
    playCue('select');
  };

  return (
    <View style={styles.screen}>
      <TripOverviewMap
        legs={legs}
        destination={destination}
        top={headerHeight}
        bottom={sheetHeight}
      />
      <MapHeader
        onHeight={setHeaderHeight}
        left={
          <IconButton
            icon="arrow_back"
            label="Retour"
            tone="raised"
            onPress={() => router.back()}
          />
        }
        center={<TripEnds origin={origin} destination={destination} size="sm" />}
        right={<HelpButton onPress={() => router.push('/help')} />}
      />
      <FloatingSheet onHeight={setSheetHeight}>
        <View style={styles.choice}>
          <TimeDials minutes={totalMinutes(legs)} size={56} crossColor={colors.white} gap={6} />
          <View style={styles.selector}>
            <ModeSelector selected={mode} onSelect={choose} />
          </View>
        </View>
        <LegList legs={legs} />
        <MainActionButton
          icon="arrow_forward"
          label="Continuer"
          shape="bar"
          onPress={() => router.push('/summary')}
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
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selector: {
    flex: 1,
  },
});
