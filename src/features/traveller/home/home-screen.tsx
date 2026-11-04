import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { pathsBounds, type LngLat } from '@/domain/geo';
import {
  CURRENT_POSITION,
  homeFraming,
  isHiddenOnMap,
  placesOnMap,
  type Place,
} from '@/domain/place';
import { playCue } from '@/services/feedback';
import { TripMap } from '@/ui/map/trip-map';
import { RECENTER_SIZE, type MapPin } from '@/ui/map/trip-map-types';
import { colors, spacing } from '@/ui/theme';

import { DEMO_CURRENT_POSITION } from '../demo/trips';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import type { TripEnd } from '../trip-plan/trip-plan-reducer';
import { ADD_BUTTON_SIZE, AddPlaceButton, COLUMN_GAP, COMPANION_SIZE } from './add-place-button';
import { HomePanel } from './home-panel';
import { PlaceSheet } from './place-sheet';
import { WayCard } from '../components/way-card';

/** Where a place shows on the map, unless it is kept off it (spec 005). */
function visiblePoint(place: Place | undefined, position: LngLat): LngLat | undefined {
  if (place?.id === CURRENT_POSITION.id) return position;
  return place && !isHiddenOnMap(place) ? place.point : undefined;
}

/**
 * Home (E01-E05, spec 009): the cream map around the traveller with their places as
 * emerald pins, the way in a pill at the top and square place tiles at the bottom. Nothing is chosen at first: the
 * start calls, then the arrival; the cards fill the end that calls. Once both are chosen,
 * cancel or go on. The floating « + » adds a place; no help here, there is no trip yet
 * (D13 revised).
 */
export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const plan = useTripPlan();
  const { origin, destination, dispatch } = plan;
  const [sheet, setSheet] = useState<TripEnd | null>(null);
  const [wayHeight, setWayHeight] = useState(0);
  const [panelHeight, setPanelHeight] = useState(0);

  // The first end still empty calls; the tiles fill it (spec 011).
  const calling: TripEnd | undefined = !origin
    ? 'origin'
    : !destination
      ? 'destination'
      : undefined;

  // The demo position stands in for GPS until spec 004.
  const position = DEMO_CURRENT_POSITION;
  const start = visiblePoint(origin, position);
  const end = visiblePoint(destination, position);

  const known = [
    ...plan.originChoices,
    ...plan.destinationChoices.filter((place) => !plan.originChoices.includes(place)),
  ];
  const pins = placesOnMap(known).flatMap((place): MapPin[] =>
    place.point
      ? [
          {
            id: place.id,
            point: place.point,
            icon: place.icon,
            label: place.helpName ?? 'Lieu',
            photo: place.photo,
            selected: place.id === destination?.id || place.id === origin?.id,
          },
        ]
      : [],
  );

  const choose = (endToFill: TripEnd, placeId: string) => {
    if (endToFill === 'origin') dispatch({ type: 'chooseOrigin', placeId });
    else dispatch({ type: 'chooseDestination', placeId });
    playCue('select');
    setSheet(null);
  };

  const createPlace = (source: 'position' | 'address') => {
    const point = source === 'position' ? position : undefined;
    dispatch({ type: 'startPlace', source, point });
    playCue('select');
    setSheet(null);
    router.push(source === 'position' ? '/add-place/position' : '/add-place/address');
  };

  // The other end's place is never offered: choosing it would silently empty that end
  // (the arrival may now be chosen first, spec 011).
  const choices =
    calling === 'origin'
      ? plan.originChoices.filter((place) => place.id !== destination?.id)
      : plan.destinationChoices.filter((place) => place.id !== origin?.id);
  const top = insets.top + spacing.md;

  return (
    <View testID="home-screen" style={styles.screen}>
      <TripMap
        camera={{
          center: start ?? position,
          zoom: 16,
          bounds:
            start && end
              ? pathsBounds([[start, end]])
              : homeFraming(
                  position,
                  pins.map((pin) => pin.point),
                ),
          // Sides: room for half of the chosen pin, which stands over its spot; on the right,
          // no pin under the column of buttons, where a touch would open another screen.
          padding: {
            top: top + wayHeight + spacing.lg,
            bottom: panelHeight + spacing.lg,
            left: spacing.xxl,
            right: spacing.gutter + ADD_BUTTON_SIZE + spacing.sm,
          },
        }}
        lines={start && end ? [{ path: [start, end], color: colors.emerald, style: 'walk' }] : []}
        traveller={{ point: position }}
        pins={pins}
        onPinPress={(placeId) => choose(calling ?? 'destination', placeId)}
        // ⓘ at the bottom left above the panel; recenter on top of the column of « + » and
        // companion, on the same axis (spec 013).
        controlsBottom={panelHeight + spacing.md}
        recenterBottom={
          panelHeight + spacing.md + ADD_BUTTON_SIZE + COLUMN_GAP + COMPANION_SIZE + COLUMN_GAP
        }
        recenterRight={spacing.gutter + (ADD_BUTTON_SIZE - RECENTER_SIZE) / 2}
      />

      <Animated.View entering={FadeInUp.springify().damping(18)} style={[styles.way, { top }]}>
        <WayCard
          size="large"
          origin={origin}
          destination={destination}
          calling={calling}
          // Touching an end, empty or chosen, opens every place for it (spec 011).
          onEnd={setSheet}
          onLayout={(event) => setWayHeight(event.nativeEvent.layout.height)}
        />
      </Animated.View>

      <HomePanel
        choosing={calling !== undefined}
        places={choices}
        onChoose={(place) => choose(calling ?? 'destination', place.id)}
        onCancel={() => dispatch({ type: 'clearDestination' })}
        onContinue={() => router.push('/mode')}
        onHeight={setPanelHeight}
      />

      <View style={[styles.add, { bottom: panelHeight + spacing.md }]}>
        <AddPlaceButton
          onAddHere={() => createPlace('position')}
          onAddAddress={() => createPlace('address')}
        />
      </View>

      {sheet && (
        <PlaceSheet
          end={sheet}
          places={sheet === 'origin' ? plan.originChoices : plan.destinationChoices}
          excludedId={sheet === 'destination' ? origin?.id : destination?.id}
          onPick={(place) => choose(sheet, place.id)}
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
  way: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
  },
  add: {
    position: 'absolute',
    right: spacing.gutter,
  },
});
