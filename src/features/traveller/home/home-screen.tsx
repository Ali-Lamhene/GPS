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
import { HelpButton } from '@/ui/components/help-button';
import { MainActionButton } from '@/ui/components/main-action-button';
import { MapHeader } from '@/ui/components/map-header';
import { TripMap } from '@/ui/map/trip-map';
import type { MapPin } from '@/ui/map/trip-map-types';
import { colors, sizes, spacing } from '@/ui/theme';

import { DEMO_CURRENT_POSITION } from '../demo/trips';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import type { TripEnd } from '../trip-plan/trip-plan-reducer';
import { PlaceSheet } from './place-sheet';
import { TRIP_COLUMN_WIDTH, TripColumn } from './trip-column';

/** Where a place shows on the map, unless it is kept off it (spec 005). */
function visiblePoint(place: Place | undefined): LngLat | undefined {
  return place && !isHiddenOnMap(place) ? place.point : undefined;
}

/**
 * Home (E01-E05, spec 005): the live map around the traveller with their places as pins,
 * and the vertical trip in a column. Touching a pin chooses the arrival; the column boxes
 * open the place sheet; the blue bar goes on to the choice of transport.
 */
export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const plan = useTripPlan();
  const { origin, destination, dispatch } = plan;
  const [sheet, setSheet] = useState<TripEnd | null>(null);

  // The demo position stands in for GPS until spec 004.
  const position = DEMO_CURRENT_POSITION;
  const start = origin?.id === CURRENT_POSITION.id ? position : visiblePoint(origin);
  const end = visiblePoint(destination);
  const ready = origin !== undefined && destination !== undefined;

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

  const createPlace = (end: TripEnd, source: 'position' | 'address') => {
    const point = source === 'position' ? position : undefined;
    dispatch({ type: 'startPlace', for: end, source, point });
    setSheet(null);
    router.push(source === 'position' ? '/add-place/position' : '/add-place/address');
  };

  const headerBottom = insets.top + spacing.md + sizes.headerButton;
  const barBottom = insets.bottom + spacing.lg;
  const mapBottom = ready ? barBottom + sizes.minTarget + spacing.lg : barBottom;

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
          // Right: room for half of the chosen pin, which stands over its spot.
          padding: {
            top: headerBottom,
            bottom: mapBottom,
            left: TRIP_COLUMN_WIDTH + spacing.lg,
            right: spacing.lg,
          },
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
        controlsBottom={mapBottom}
      />

      <View style={[styles.column, { top: insets.top + spacing.md }]}>
        <TripColumn
          origin={origin}
          destination={destination}
          onOrigin={() => setSheet('origin')}
          onDestination={() => setSheet('destination')}
        />
      </View>

      {ready && (
        <View style={[styles.action, { bottom: barBottom }]} pointerEvents="box-none">
          <MainActionButton icon="check" label="Continuer" onPress={() => router.push('/mode')} />
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

      {/* Above the place sheet too: help stays top right on every screen (D13). */}
      <MapHeader right={<HelpButton onPress={() => router.push('/help')} />} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.mapGround,
    overflow: 'hidden',
  },
  column: {
    position: 'absolute',
    left: spacing.lg,
  },
  action: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
  },
});
