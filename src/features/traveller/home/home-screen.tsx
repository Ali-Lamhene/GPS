import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FRANCE_CENTER, FRANCE_ZOOM, pathsBounds, type LngLat } from '@/domain/geo';
import { CURRENT_POSITION, homeFraming, placesOnMap, type Place } from '@/domain/place';
import { playCue } from '@/services/feedback';
import { useIsOffline } from '@/services/network';
import { TripMap } from '@/ui/map/trip-map';
import { RECENTER_SIZE, type MapPin } from '@/ui/map/trip-map-types';
import { colors, spacing } from '@/ui/theme';

import { positionPoint, useTravellerPosition } from '../location/location-context';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import type { TripEnd } from '../trip-plan/trip-plan-reducer';
import { ADD_BUTTON_SIZE, AddPlaceButton, COLUMN_GAP, COMPANION_SIZE } from './add-place-button';
import { HomeWay } from './home-way';
import type { HereUnavailable } from './here-state';
import { OfflineBadge } from './offline-badge';
import { PlaceSheet } from './place-sheet';
import { SaveFailedSignal } from './save-failed-signal';

const STREET_ZOOM = 16;

/** Where a place shows on the map (spec 005). */
function visiblePoint(place: Place | undefined, position: LngLat | undefined): LngLat | undefined {
  if (place?.id === CURRENT_POSITION.id) return position;
  return place ? place.point : undefined;
}

/**
 * Home (E01-E05, specs 009, 035): the cream map around the traveller with their places as
 * emerald pins, and the way, start ····· arrival, in a pill at the bottom. Nothing is chosen
 * at first: the start calls, then the arrival; a pin or a touch on an end (which opens the
 * place sheet) fills the end that calls. Once both are chosen, cancel or go on. The floating
 * « + » adds a place; no help here, there is no trip yet (D13 revised).
 */
export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const plan = useTripPlan();
  const { origin, destination, dispatch } = plan;
  const [sheet, setSheet] = useState<TripEnd | null>(null);
  const [wayHeight, setWayHeight] = useState(0);

  // The first end still empty calls; a pin fills it (spec 011).
  const calling: TripEnd | undefined = !origin
    ? 'origin'
    : !destination
      ? 'destination'
      : undefined;

  // The phone's position (spec 017); unknown while searching or refused.
  const { position: located, retry } = useTravellerPosition();
  const position = positionPoint(located);
  const hereUnavailable: HereUnavailable | undefined =
    located.kind === 'located' ? undefined : located.kind === 'searching' ? 'searching' : 'off';
  const offline = useIsOffline();
  // The framing follows the traveller by steps of about 100 m: each GPS update would
  // otherwise take the map back from a traveller looking at a pin (spec 017).
  const framingPoint: LngLat | undefined = position
    ? [Math.round(position[0] * 1000) / 1000, Math.round(position[1] * 1000) / 1000]
    : undefined;
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

  // A touch on « here » or « + » without a position: heard and felt, then asked again.
  const positionUnavailable = () => {
    playCue('unavailable');
    retry();
  };

  const choose = (endToFill: TripEnd, placeId: string) => {
    // « Here » without a position asks for it again (spec 017).
    if (placeId === CURRENT_POSITION.id && hereUnavailable) {
      positionUnavailable();
      return;
    }
    // The other end's place is never taken: choosing it would silently empty that end, or
    // play « select » for nothing (the arrival may be chosen first, spec 011).
    const otherEnd = endToFill === 'origin' ? destination : origin;
    if (placeId === otherEnd?.id) return;
    if (endToFill === 'origin') {
      dispatch({
        type: 'chooseOrigin',
        placeId,
        here: placeId === CURRENT_POSITION.id ? position : undefined,
      });
    } else dispatch({ type: 'chooseDestination', placeId });
    playCue('select');
    setSheet(null);
  };

  const createPlace = (source: 'position' | 'address') => {
    if (source === 'position' && !position) {
      positionUnavailable();
      return;
    }
    const point = source === 'position' ? position : undefined;
    dispatch({ type: 'startPlace', source, point });
    playCue('select');
    setSheet(null);
    router.push(source === 'position' ? '/add-place/position' : '/add-place/address');
  };

  const top = insets.top + spacing.md;

  return (
    <View testID="home-screen" style={styles.screen}>
      <TripMap
        camera={{
          center: start ?? position ?? FRANCE_CENTER,
          zoom: start || position ? STREET_ZOOM : FRANCE_ZOOM,
          bounds:
            start && end
              ? pathsBounds([[start, end]])
              : homeFraming(
                  framingPoint,
                  pins.map((pin) => pin.point),
                ),
          // Sides: room for half of the chosen pin, which stands over its spot; on the right,
          // no pin under the column of buttons, where a touch would open another screen.
          padding: {
            top: top + spacing.lg,
            bottom: wayHeight + spacing.lg,
            left: spacing.xxl,
            right: spacing.gutter + ADD_BUTTON_SIZE + spacing.sm,
          },
        }}
        lines={start && end ? [{ path: [start, end], color: colors.emerald, style: 'walk' }] : []}
        traveller={position ? { point: position } : undefined}
        pins={pins}
        onPinPress={(placeId) => choose(calling ?? 'destination', placeId)}
        // While the start calls, the traveller's own dot chooses « here » (spec 035).
        onTravellerPress={
          calling === 'origin' && position ? () => choose('origin', CURRENT_POSITION.id) : undefined
        }
        // ⓘ at the bottom left above the way; recenter on top of the column of « + » and
        // companion, on the same axis (spec 013).
        controlsBottom={wayHeight + spacing.md}
        // Both ends chosen: the column is gone (one decision left, ✓), recenter sits alone.
        recenterBottom={
          calling === undefined
            ? wayHeight + spacing.md
            : wayHeight + spacing.md + ADD_BUTTON_SIZE + COLUMN_GAP + COMPANION_SIZE + COLUMN_GAP
        }
        recenterRight={spacing.gutter + (ADD_BUTTON_SIZE - RECENTER_SIZE) / 2}
      />

      <HomeWay
        origin={origin}
        destination={destination}
        calling={calling}
        // Touching an end, empty or chosen, opens every place for it (spec 035).
        onEnd={setSheet}
        onCancel={() => dispatch({ type: 'clearDestination' })}
        onContinue={() => router.push('/mode')}
        onHeight={setWayHeight}
      />

      {/* Once both ends are chosen, only ✓ is left to touch: « + » must not sit by it (spec 035). */}
      {calling !== undefined && (
        <View style={[styles.add, { bottom: wayHeight + spacing.md }]}>
          <AddPlaceButton
            onAddHere={() => createPlace('position')}
            hereUnavailable={hereUnavailable}
            onAddAddress={() => createPlace('address')}
          />
        </View>
      )}

      {sheet && (
        <PlaceSheet
          end={sheet}
          places={sheet === 'origin' ? plan.originChoices : plan.destinationChoices}
          excludedId={sheet === 'destination' ? origin?.id : destination?.id}
          onPick={(place) => choose(sheet, place.id)}
          onAdd={() => createPlace('position')}
          hereUnavailable={hereUnavailable}
          onClose={() => setSheet(null)}
        />
      )}

      {offline && <OfflineBadge top={top} />}

      {plan.saveFailed && <SaveFailedSignal onDone={() => dispatch({ type: 'clearSaveFailed' })} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.mapGround,
    overflow: 'hidden',
  },
  add: {
    position: 'absolute',
    right: spacing.gutter,
  },
});
