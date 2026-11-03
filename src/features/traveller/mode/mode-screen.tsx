import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { totalMinutes, type TravelMode } from '@/domain/trip';
import { playCue } from '@/services/feedback';
import { FloatingSheet } from '@/ui/components/floating-sheet';
import { HelpButton } from '@/ui/components/help-button';
import { IconButton } from '@/ui/components/icon-button';
import { MainActionButton } from '@/ui/components/main-action-button';
import { MapHeader } from '@/ui/components/map-header';
import { TimeDials } from '@/ui/components/time-dials';
import { colors } from '@/ui/theme';

import { WayCard } from '../components/way-card';
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
  const { height } = useWindowDimensions();
  const legs = DEMO_LEGS[mode];
  const total = totalMinutes(legs);

  const choose = (next: TravelMode) => {
    dispatch({ type: 'chooseMode', mode: next });
    playCue('select');
  };

  return (
    <View style={styles.screen}>
      <TripOverviewMap
        legs={legs}
        origin={origin}
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
        center={<WayCard origin={origin} destination={destination} />}
        right={<HelpButton onPress={() => router.push('/help')} />}
      />
      <FloatingSheet onHeight={setSheetHeight}>
        {/* The three modes, then the total time of the chosen one below (spec 010). */}
        <View style={styles.choice}>
          <ModeSelector selected={mode} onSelect={choose} />
          <View style={styles.dials}>
            <TimeDials minutes={total} size={36} crossColor={colors.white} gap={6} />
          </View>
        </View>
        {/* On short screens the map shows the legs; the list would leave it no room. */}
        {height >= 700 && <LegList legs={legs} />}
        <MainActionButton icon="check" label="Continuer" onPress={() => router.push('/summary')} />
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
    gap: 12,
  },
  dials: {
    alignItems: 'center',
  },
});
