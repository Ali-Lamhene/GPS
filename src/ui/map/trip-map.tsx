import {
  Camera,
  GeoJSONSource,
  Layer,
  Map as MapView,
  Marker,
  type CameraRef,
  type LngLatBounds,
} from '@maplibre/maplibre-react-native';
import type { FeatureCollection } from 'geojson';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MAP_CREDIT, MAP_TILES_URL } from '@/services/map-tiles';
import { IconButton } from '@/ui/components/icon-button';
import { colors } from '@/ui/theme';

import { secureNativeMap } from './native-map-setup';
import {
  DestinationPin,
  ManeuverArrow,
  OriginPin,
  PlacePin,
  StopPin,
  TravellerCone,
  TravellerDot,
} from './map-markers';
import { MapCredit } from './map-texts';
import { buildMapStyle } from './map-style';
import { RECENTER_SIZE, type MapLine, type TripMapProps } from './trip-map-types';

// Phone map of spec 002: MapLibre Native over the bundled Marseille tiles, without labels,
// the same as the browser one (trip-map.web.tsx).

/** Whether a real map is drawn on this platform; screens skip optional maps otherwise. */
export const MAP_RENDERS = true;

/** After the traveller moves the map, it follows them again on its own after this delay. */
const REFOLLOW_MS = 10_000;
const MOVE_MS = 900;

secureNativeMap();

function routeData(lines: readonly MapLine[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: lines.map((line) => ({
      type: 'Feature',
      properties: { color: line.color, style: line.style },
      geometry: { type: 'LineString', coordinates: line.path.map(([lon, lat]) => [lon, lat]) },
    })),
  };
}

const LINE_LAYOUT = { 'line-cap': 'round', 'line-join': 'round' } as const;

function isStyle(value: MapLine['style']) {
  return ['==', ['get', 'style'], value] as ['==', ['get', string], string];
}

/** The route of the trip: walked part grey, vehicles solid and bordered, walking dotted. */
function RouteLayers({ lines }: { lines: readonly MapLine[] }) {
  const data = useMemo(() => routeData(lines), [lines]);
  return (
    <GeoJSONSource id="route" data={data}>
      <Layer
        id="route-done"
        type="line"
        filter={isStyle('done')}
        layout={LINE_LAYOUT}
        paint={{ 'line-color': colors.inkDisabled, 'line-opacity': 0.7, 'line-width': 6 }}
      />
      <Layer
        id="route-vehicle-casing"
        type="line"
        filter={isStyle('vehicle')}
        layout={LINE_LAYOUT}
        paint={{ 'line-color': colors.onSecondaryContainer, 'line-width': 14 }}
      />
      <Layer
        id="route-vehicle"
        type="line"
        filter={isStyle('vehicle')}
        layout={LINE_LAYOUT}
        paint={{ 'line-color': ['get', 'color'], 'line-width': 9 }}
      />
      {/* White halo under the walking dots, so they stand out on white streets. */}
      <Layer
        id="route-walk-casing"
        type="line"
        filter={isStyle('walk')}
        layout={LINE_LAYOUT}
        paint={{ 'line-color': colors.white, 'line-width': 13, 'line-dasharray': [0, 1.2] }}
      />
      <Layer
        id="route-walk"
        type="line"
        filter={isStyle('walk')}
        layout={LINE_LAYOUT}
        paint={{ 'line-color': ['get', 'color'], 'line-width': 8, 'line-dasharray': [0, 1.95] }}
      />
    </GeoJSONSource>
  );
}

export function TripMap({
  camera,
  lines = [],
  stops = [],
  maneuver,
  traveller,
  origin,
  destination,
  backdrop = false,
  interactive = true,
  controlsBottom = 16,
  recenterBottom,
  recenterRight,
  recenterIcon = 'my_location',
  pins = [],
  onPinPress,
}: TripMapProps) {
  // Online tiles (spec 017): without network, the ground stays plain and routes and markers
  // are still drawn.
  const mapStyle = useMemo(() => buildMapStyle(MAP_TILES_URL, MAP_CREDIT), []);

  const cameraRef = useRef<CameraRef>(null);
  const [initial] = useState(camera);
  const still = backdrop || !interactive;
  // The framing the traveller moved away from by hand, if any: a new framing asked by the
  // screen (another leg opened) takes over again.
  const [movedFrom, setMovedFrom] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState(0);
  const boundsKey = JSON.stringify(camera.bounds ?? null);
  const framing = useRef(boundsKey);
  useEffect(() => {
    framing.current = boundsKey;
  }, [boundsKey]);
  const following = movedFrom !== boundsKey;

  useEffect(() => {
    if (following) return;
    const timer = setTimeout(() => setMovedFrom(null), REFOLLOW_MS);
    return () => clearTimeout(timer);
  }, [following, lastMove]);

  const [centerLon, centerLat] = camera.center;
  const { zoom, heading: bearing = 0, pitch = 0 } = camera;
  const paddingTop = camera.padding?.top ?? 0;
  const paddingBottom = camera.padding?.bottom ?? 0;
  const paddingLeft = camera.padding?.left ?? 0;
  const paddingRight = camera.padding?.right ?? 0;
  useEffect(() => {
    const ref = cameraRef.current;
    if (!ref || !following) return;
    const bounds = JSON.parse(boundsKey) as TripMapProps['camera']['bounds'] | null;
    if (bounds) {
      const box: LngLatBounds = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]];
      ref.fitBounds(box, {
        // Room for the pins, which stand above their point.
        padding: {
          top: paddingTop + 64,
          bottom: paddingBottom + 24,
          left: paddingLeft + 32,
          right: paddingRight + 32,
        },
        bearing: 0,
        pitch: 0,
        duration: MOVE_MS,
      });
      return;
    }
    ref.easeTo({
      center: [centerLon, centerLat],
      zoom,
      bearing,
      pitch,
      padding: { top: paddingTop, bottom: paddingBottom, left: paddingLeft, right: paddingRight },
      duration: MOVE_MS,
    });
  }, [
    following,
    boundsKey,
    centerLon,
    centerLat,
    zoom,
    bearing,
    pitch,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
  ]);

  // Markers stand up on the screen: turn them by their heading on the map, less the map's.
  const turn = (heading: number) => heading - bearing;

  return (
    <View style={[StyleSheet.absoluteFill, styles.ground]}>
      <MapView
        style={StyleSheet.absoluteFill}
        mapStyle={mapStyle}
        // A texture draws inside the view tree: a GL surface shows black until its first
        // frame and while screens slide over it.
        androidView="texture"
        // One finger moves the map, two zoom (spec 005); a double tap never zooms by
        // mistake. The map comes back to the traveller on its own after a while.
        dragPan={!still}
        touchZoom={!still}
        doubleTapZoom={false}
        doubleTapHoldZoom={false}
        touchRotate={false}
        touchPitch={false}
        // MapLibre's own credit opens websites, and its logo, compass and scale are text
        // or figures: the credit is the folded ⓘ below (D9).
        attribution={false}
        logo={false}
        compass={false}
        scaleBar={false}
        onRegionWillChange={(event) => {
          if (!event.nativeEvent.userInteraction) return;
          setMovedFrom(framing.current);
          setLastMove(Date.now());
        }}
      >
        <Camera
          ref={cameraRef}
          maxZoom={19}
          initialViewState={
            initial.bounds
              ? {
                  bounds: [
                    initial.bounds[0][0],
                    initial.bounds[0][1],
                    initial.bounds[1][0],
                    initial.bounds[1][1],
                  ],
                }
              : {
                  center: [initial.center[0], initial.center[1]],
                  zoom: initial.zoom,
                  bearing: initial.heading ?? 0,
                  pitch: initial.pitch ?? 0,
                }
          }
        />
        <RouteLayers lines={lines} />
        {stops.map((stop, index) => (
          <Marker key={`stop-${index}`} lngLat={[stop.point[0], stop.point[1]]} anchor="bottom">
            <StopPin symbol={stop.symbol} color={stop.color} alight={stop.alight ?? false} />
          </Marker>
        ))}
        {origin && (
          <Marker lngLat={[origin.point[0], origin.point[1]]} anchor="bottom">
            <OriginPin icon={origin.icon} />
          </Marker>
        )}
        {destination && (
          <Marker lngLat={[destination.point[0], destination.point[1]]} anchor="bottom">
            <DestinationPin icon={destination.icon} />
          </Marker>
        )}
        {pins.map((pin) => (
          <Marker key={pin.id} lngLat={[pin.point[0], pin.point[1]]} anchor="bottom">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={pin.label}
              onPress={() => onPinPress?.(pin.id)}
            >
              <PlacePin icon={pin.icon} photo={pin.photo} selected={pin.selected ?? false} />
            </Pressable>
          </Marker>
        ))}
        {maneuver && (
          <Marker lngLat={[maneuver.point[0], maneuver.point[1]]}>
            <ManeuverArrow rotation={turn(maneuver.heading)} />
          </Marker>
        )}
        {traveller?.heading !== undefined && (
          <Marker lngLat={[traveller.point[0], traveller.point[1]]}>
            <TravellerCone rotation={turn(traveller.heading)} />
          </Marker>
        )}
        {traveller && (
          <Marker lngLat={[traveller.point[0], traveller.point[1]]}>
            <TravellerDot />
          </Marker>
        )}
      </MapView>
      {backdrop && <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.veil]} />}
      <View style={[styles.credit, { bottom: controlsBottom }]}>
        <MapCredit />
      </View>
      {!following && (
        <View
          style={[
            styles.recenter,
            { bottom: recenterBottom ?? controlsBottom + 8 },
            recenterRight !== undefined && { right: recenterRight },
          ]}
        >
          {/* Round warm-white target of the emerald mockup (spec 009). */}
          <IconButton
            icon={recenterIcon}
            label="Recentrer"
            tone="warm"
            size={RECENTER_SIZE}
            iconSize={24}
            iconVariant="outlined"
            onPress={() => setMovedFrom(null)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ground: {
    backgroundColor: colors.mapGround,
  },
  veil: {
    backgroundColor: 'rgba(244,241,234,.6)',
  },
  // Unfolded, the credit wraps before the column of round buttons on the right (spec 024).
  credit: {
    position: 'absolute',
    left: 12,
    right: 112,
    alignItems: 'flex-start',
  },
  recenter: {
    position: 'absolute',
    right: 16,
  },
});
