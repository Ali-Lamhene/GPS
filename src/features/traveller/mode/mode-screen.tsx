import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, useWindowDimensions, View } from 'react-native';

import { totalMinutes, type TravelMode } from '@/domain/trip';
import { playCue } from '@/services/feedback';
import { FloatingSheet } from '@/ui/components/floating-sheet';
import { HelpButton } from '@/ui/components/help-button';
import { IconButton } from '@/ui/components/icon-button';
import { MainActionButton } from '@/ui/components/main-action-button';
import { MapHeader } from '@/ui/components/map-header';
import { TimeDials } from '@/ui/components/time-dials';
import { Icon } from '@/ui/icon/icon';
import { colors } from '@/ui/theme';

import { WayCard } from '../components/way-card';
import { TripOverviewMap } from '../components/trip-overview-map';
import { useRoutes } from '../trip-plan/routes-context';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import { LegList } from './leg-list';
import { ModeSelector } from './mode-selector';

const MODES: readonly TravelMode[] = ['walk', 'transit'];

/**
 * E06 (specs 002, 021): the trip drawn on the map; choosing how to travel redraws it. The
 * trips are computed online; a mode without one is pale.
 */
export function ModeScreen() {
  const { origin, destination, mode, dispatch } = useTripPlan();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(0);
  const { height } = useWindowDimensions();
  const { legs, routes, request } = useRoutes();
  const total = totalMinutes(legs);
  const unavailable = MODES.filter((each) => {
    const kind = routes[each].kind;
    return kind === 'none' || kind === 'offline';
  });
  const loading = routes[mode].kind === 'loading';
  const settled = MODES.every((each) => routes[each].kind !== 'loading');
  const firstReady = MODES.find((each) => routes[each].kind === 'ready');
  const anyOffline = MODES.some((each) => routes[each].kind === 'offline');
  // Every answer in, no trip at all: no network (E25), or none to offer (here, with help).
  const noNetwork = settled && !firstReady && anyOffline;
  const noTrip = settled && !firstReady && !anyOffline;

  // The trips are asked for once the traveller comes here, never for every end tried.
  useEffect(() => {
    request();
    // Once per visit: `request` changes with every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No network for a new trip (D4): the connection screen (E25), which retries on return.
  useEffect(() => {
    if (noNetwork) router.push('/connection-error');
  }, [noNetwork]);

  useEffect(() => {
    if (noTrip) playCue('alert');
  }, [noTrip]);

  // The chosen mode has no trip: the first one that has (spec 021).
  useEffect(() => {
    if (!loading && unavailable.includes(mode) && firstReady) {
      dispatch({ type: 'chooseMode', mode: firstReady });
      playCue('select');
    }
  }, [loading, unavailable, mode, firstReady, dispatch]);

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
          <ModeSelector selected={mode} onSelect={choose} unavailable={unavailable} />
          <View style={styles.dials}>
            {noTrip ? (
              // No trip between these two places: the crossed-out place, the alert, and help
              // stays at hand at the top (D13).
              <View testID="no-trip">
                <Icon name="wrong_location" size={56} color={colors.alert} />
              </View>
            ) : loading ? (
              // The trip is being computed: a quiet turning wheel, no text.
              <ActivityIndicator testID="route-loading" size="large" color={colors.emerald} />
            ) : (
              <TimeDials minutes={total} size={36} crossColor={colors.white} gap={6} />
            )}
          </View>
        </View>
        {/* On short screens the map shows the legs; the list would leave it no room. */}
        {height >= 700 && <LegList legs={legs} />}
        <MainActionButton
          icon="check"
          label="Continuer"
          disabled={legs.length === 0}
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
    gap: 12,
  },
  dials: {
    alignItems: 'center',
  },
});
