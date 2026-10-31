import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Place } from '@/domain/place';
import { HelpButton } from '@/ui/components/help-button';
import { TripMap } from '@/ui/map/trip-map';
import { MainActionButton } from '@/ui/components/main-action-button';
import { colors } from '@/ui/theme';

import { DEMO_CURRENT_POSITION } from '../demo/trips';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import type { TripEnd } from '../trip-plan/trip-plan-reducer';
import { PlaceSheet } from './place-sheet';
import { TRAIL_END, TRAIL_START, TripTrail } from './trip-trail';
import { TripEndpoint } from './trip-endpoint';

const START_SIZE = 112;
const END_BOX = 128;

/**
 * Home (E01-E05): over the real map around the traveller, a vertical trail from the start
 * to the arrival (spec 002). The traveller touches the pulsing tile, picks a place in the
 * sheet, then the blue disc to go on.
 */
export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const plan = useTripPlan();
  const { origin, destination, dispatch } = plan;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [sheet, setSheet] = useState<TripEnd | null>(null);

  const stage = destination ? 'ready' : origin ? 'started' : 'empty';

  const pick = (end: TripEnd, place: Place) => {
    dispatch({
      type: end === 'origin' ? 'chooseOrigin' : 'chooseDestination',
      placeId: place.id,
    });
    setSheet(null);
  };

  const createPlace = (end: TripEnd, source: 'position' | 'address') => {
    dispatch({ type: 'startPlace', for: end, source });
    setSheet(null);
    router.push(source === 'position' ? '/add-place/position' : '/add-place/address');
  };

  return (
    <View
      testID="home-screen"
      style={styles.screen}
      onLayout={(event) => setSize(event.nativeEvent.layout)}
    >
      <TripMap camera={{ center: DEMO_CURRENT_POSITION, zoom: 15.6 }} backdrop />
      {size.width > 0 && (
        <>
          <TripTrail width={size.width} height={size.height} stage={stage} />
          <View
            style={[
              styles.anchor,
              {
                left: TRAIL_START.x * size.width - START_SIZE / 2,
                top: TRAIL_START.y * size.height - START_SIZE / 2,
              },
            ]}
          >
            <TripEndpoint
              end="origin"
              place={origin}
              pulsing={stage === 'empty'}
              size={START_SIZE}
              onPress={() => setSheet('origin')}
            />
          </View>
          <View
            style={[
              styles.anchor,
              styles.endBox,
              {
                left: TRAIL_END.x * size.width - END_BOX / 2,
                top: TRAIL_END.y * size.height - END_BOX / 2,
              },
            ]}
          >
            <TripEndpoint
              end="destination"
              place={destination}
              pulsing={stage === 'started'}
              size={destination ? END_BOX : START_SIZE}
              disabled={!origin}
              onPress={() => setSheet('destination')}
            />
          </View>
        </>
      )}

      <View style={[styles.help, { top: insets.top + 20 }]}>
        <HelpButton onPress={() => router.push('/help')} />
      </View>

      {stage === 'ready' && (
        <View style={[styles.action, { bottom: insets.bottom + 28 }]} pointerEvents="box-none">
          <MainActionButton
            icon="arrow_forward"
            label="Continuer"
            onPress={() => router.push('/mode')}
          />
        </View>
      )}

      {sheet && (
        <PlaceSheet
          end={sheet}
          places={sheet === 'origin' ? plan.originChoices : plan.destinationChoices}
          excludedId={sheet === 'destination' ? origin?.id : undefined}
          onPick={(place) => pick(sheet, place)}
          onAddPosition={() => createPlace(sheet, 'position')}
          onCompanion={() => createPlace(sheet, 'address')}
          onClose={() => setSheet(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.mapGround,
    overflow: 'hidden',
  },
  anchor: {
    position: 'absolute',
  },
  endBox: {
    width: END_BOX,
    height: END_BOX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  help: {
    position: 'absolute',
    right: 16,
  },
  action: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
