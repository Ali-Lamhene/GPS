import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { MapHeader } from '@/ui/components/map-header';
import { TripMap } from '@/ui/map/trip-map';
import type { MapPin } from '@/ui/map/trip-map-types';
import { colors, sizes, spacing } from '@/ui/theme';

import { DEMO_CURRENT_POSITION } from '../demo/trips';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import type { TripEnd } from '../trip-plan/trip-plan-reducer';
import { AddPlaceButton } from './add-place-button';
import { HomePanel } from './home-panel';
import { PlaceSheet } from './place-sheet';

/** Where a place shows on the map, unless it is kept off it (spec 005). */
function visiblePoint(place: Place | undefined): LngLat | undefined {
  return place && !isHiddenOnMap(place) ? place.point : undefined;
}

/**
 * Home (E01-E05, specs 005 and 007): the live map around the traveller with their places
 * as pins, and a floating card with the way from the start to the arrival and a carousel
 * of the places. Touching a pin or a card chooses the arrival; then cancel or go on. The
 * « + » at the top right adds a place; no help here, there is no trip yet (D13 revised).
 */
export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const plan = useTripPlan();
  const { origin, destination, dispatch } = plan;
  const [sheet, setSheet] = useState<TripEnd | null>(null);
  const [panelHeight, setPanelHeight] = useState(0);

  // The demo position stands in for GPS until spec 004.
  const position = DEMO_CURRENT_POSITION;
  const start = origin?.id === CURRENT_POSITION.id ? position : visiblePoint(origin);
  const end = visiblePoint(destination);

  const pins = placesOnMap(plan.destinationChoices, origin?.id).flatMap((place): MapPin[] =>
    place.point
      ? [
          {
            id: place.id,
            point: place.point,
            icon: place.icon,
            label: place.helpName ?? 'Lieu',
            photo: place.photo,
            selected: place.id === destination?.id,
          },
        ]
      : [],
  );

  const chooseDestination = (placeId: string) => {
    dispatch({ type: 'chooseDestination', placeId });
    playCue('select');
  };

  const pick = (end: TripEnd, place: Place) => {
    if (end === 'destination') chooseDestination(place.id);
    else dispatch({ type: 'chooseOrigin', placeId: place.id });
    setSheet(null);
  };

  const createPlace = (source: 'position' | 'address') => {
    const point = source === 'position' ? position : undefined;
    dispatch({ type: 'startPlace', source, point });
    playCue(source === 'address' ? 'hold' : 'select');
    setSheet(null);
    router.push(source === 'position' ? '/add-place/position' : '/add-place/address');
  };

  const headerBottom = insets.top + spacing.md + sizes.headerButton;
  const arrivals = plan.destinationChoices.filter((place) => place.id !== origin?.id);

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
          // Sides: room for half of the chosen pin, which stands over its spot.
          padding: { top: headerBottom, bottom: panelHeight, left: spacing.lg, right: spacing.lg },
        }}
        lines={start && end ? [{ path: [start, end], color: colors.primary, style: 'walk' }] : []}
        traveller={{ point: position }}
        origin={
          origin && origin.id !== CURRENT_POSITION.id && start
            ? { point: start, icon: origin.icon }
            : undefined
        }
        pins={pins}
        onPinPress={chooseDestination}
        controlsBottom={panelHeight + spacing.sm}
      />

      <HomePanel
        origin={origin}
        destination={destination}
        places={arrivals}
        onOrigin={() => setSheet('origin')}
        onAllPlaces={() => setSheet('destination')}
        onChoose={(place) => chooseDestination(place.id)}
        onCancel={() => dispatch({ type: 'clearDestination' })}
        onContinue={() => router.push('/mode')}
        onHeight={setPanelHeight}
      />

      {sheet && (
        <PlaceSheet
          end={sheet}
          places={sheet === 'origin' ? plan.originChoices : plan.destinationChoices}
          excludedId={sheet === 'destination' ? origin?.id : undefined}
          onPick={(place) => pick(sheet, place)}
          onClose={() => setSheet(null)}
        />
      )}

      <MapHeader
        right={
          <AddPlaceButton
            onAddHere={() => createPlace('position')}
            onAddAddress={() => createPlace('address')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.mapGround,
    overflow: 'hidden',
  },
});
