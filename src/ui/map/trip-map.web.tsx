import 'maplibre-gl/dist/maplibre-gl.css';

import type { FeatureCollection } from 'geojson';
import {
  addProtocol,
  AttributionControl,
  Map as MapLibreMap,
  Marker,
  setWorkerUrl,
  type ExpressionSpecification,
  type AddProtocolAction,
  type GeoJSONSource,
} from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { LngLat } from '@/domain/geo';
import { BUNDLED_TILES_URL, registerOfflineTiles } from '@/services/offline-map';
import { IconButton } from '@/ui/components/icon-button';
import type { IconName } from '@/ui/icon/icon';
import { colors } from '@/ui/theme';

import {
  createDestinationPin,
  createManeuverArrow,
  createStopPin,
  createTravellerCone,
  createTravellerDot,
  foldAttribution,
  injectMapCss,
} from './map-markers.web';
import { buildFallbackStyle, buildMapStyle } from './map-style';
import type { MapLine, TripMapProps } from './trip-map-types';

// Browser map of spec 002: MapLibre over the bundled Marseille tiles, without labels.

/** After the traveller moves the map, it follows them again on its own after this delay. */
const REFOLLOW_MS = 10_000;

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

function addRouteLayers(map: MapLibreMap) {
  map.addSource('route', { type: 'geojson', data: routeData([]) });
  const style = (value: MapLine['style']): ExpressionSpecification => [
    '==',
    ['get', 'style'],
    value,
  ];
  const layout = { 'line-cap': 'round', 'line-join': 'round' } as const;
  map.addLayer({
    id: 'route-done',
    type: 'line',
    source: 'route',
    filter: style('done'),
    layout,
    paint: { 'line-color': colors.inkDisabled, 'line-opacity': 0.7, 'line-width': 6 },
  });
  map.addLayer({
    id: 'route-vehicle-casing',
    type: 'line',
    source: 'route',
    filter: style('vehicle'),
    layout,
    paint: { 'line-color': colors.onSecondaryContainer, 'line-width': 14 },
  });
  map.addLayer({
    id: 'route-vehicle',
    type: 'line',
    source: 'route',
    filter: style('vehicle'),
    layout,
    paint: { 'line-color': ['get', 'color'], 'line-width': 9 },
  });
  // White halo under the walking dots, so they stand out on white streets.
  map.addLayer({
    id: 'route-walk-casing',
    type: 'line',
    source: 'route',
    filter: style('walk'),
    layout,
    paint: { 'line-color': '#FFFFFF', 'line-width': 13, 'line-dasharray': [0, 1.2] },
  });
  map.addLayer({
    id: 'route-walk',
    type: 'line',
    source: 'route',
    filter: style('walk'),
    layout,
    paint: { 'line-color': ['get', 'color'], 'line-width': 8, 'line-dasharray': [0, 1.95] },
  });
}

type MarkerKind =
  | { type: 'dot' }
  | { type: 'cone' }
  | { type: 'maneuver' }
  | { type: 'destination'; icon: IconName };

function markerFor(kind: MarkerKind): Marker {
  switch (kind.type) {
    case 'dot':
      return new Marker({ element: createTravellerDot(), pitchAlignment: 'viewport' });
    case 'cone':
      return new Marker({
        element: createTravellerCone(),
        rotationAlignment: 'map',
        pitchAlignment: 'map',
      });
    case 'maneuver':
      return new Marker({
        element: createManeuverArrow(),
        rotationAlignment: 'map',
        pitchAlignment: 'viewport',
      });
    case 'destination':
      return new Marker({ element: createDestinationPin(kind.icon), anchor: 'bottom' });
  }
}

/** A marker created once per kind, then moved and turned as its position changes. */
function useMarker(
  map: MapLibreMap | null,
  kind: MarkerKind,
  point: LngLat | undefined,
  rotation = 0,
) {
  const marker = useRef<Marker | null>(null);
  const kindKey = JSON.stringify(kind);
  const [lon, lat] = point ?? [];

  useEffect(() => {
    if (!map) return;
    const instance = markerFor(JSON.parse(kindKey));
    marker.current = instance;
    return () => {
      instance.remove();
      marker.current = null;
    };
  }, [map, kindKey]);

  useEffect(() => {
    const instance = marker.current;
    if (!map || !instance) return;
    if (lon === undefined || lat === undefined) {
      instance.remove();
      return;
    }
    instance.setLngLat([lon, lat]).setRotation(rotation).addTo(map);
  }, [map, kindKey, lon, lat, rotation]);
}

export function TripMap({
  camera,
  lines = [],
  stops = [],
  maneuver,
  traveller,
  destination,
  backdrop = false,
  interactive = true,
  controlsBottom = 16,
}: TripMapProps) {
  const container = useRef<HTMLDivElement | null>(null);
  const initial = useRef({ camera, still: backdrop || !interactive });
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [following, setFollowing] = useState(true);
  const [lastMove, setLastMove] = useState(0);

  useEffect(() => {
    injectMapCss();
    let created: MapLibreMap | undefined;
    let cancelled = false;
    const create = (tilesReady: boolean) => {
      const element = container.current;
      if (cancelled || !element) return;
      const { center, zoom, heading = 0, pitch = 0 } = initial.current.camera;
      const instance = new MapLibreMap({
        container: element,
        style: tilesReady ? buildMapStyle(BUNDLED_TILES_URL) : buildFallbackStyle(),
        center: [center[0], center[1]],
        zoom,
        bearing: heading,
        pitch,
        maxZoom: 19,
        interactive: !initial.current.still,
        // Only a two-finger pinch moves the map: a stray tap, double tap or drag never
        // loses the traveller's position.
        dragPan: false,
        dragRotate: false,
        doubleClickZoom: false,
        touchPitch: false,
        keyboard: false,
        // Added below without MapLibre's default link: nothing in it can open a website.
        attributionControl: false,
      });
      instance.addControl(new AttributionControl({ compact: true }), 'bottom-left');
      instance.touchZoomRotate.disableRotation();
      instance.on('movestart', (event) => {
        if (!event.originalEvent) return;
        setFollowing(false);
        setLastMove(Date.now());
      });
      instance.on('load', () => {
        foldAttribution(element);
        addRouteLayers(instance);
        setMap(instance);
      });
      created = instance;
    };
    // Served from public/ (scripts/copy-map-worker.js).
    setWorkerUrl('/maplibre-gl-worker.mjs');
    registerOfflineTiles((name, handler) =>
      // pmtiles and MapLibre describe the same tile response with different types.
      addProtocol(name, handler as AddProtocolAction),
    ).then(
      () => create(true),
      // Unreadable archive: plain ground, routes and markers still drawn (spec 002).
      () => create(false),
    );
    return () => {
      cancelled = true;
      created?.remove();
    };
  }, []);

  useEffect(() => {
    if (following) return;
    const timer = setTimeout(() => setFollowing(true), REFOLLOW_MS);
    return () => clearTimeout(timer);
  }, [following, lastMove]);

  const linesKey = JSON.stringify(lines);
  useEffect(() => {
    map?.getSource<GeoJSONSource>('route')?.setData(routeData(JSON.parse(linesKey)));
  }, [map, linesKey]);

  const heading = traveller?.heading;
  useMarker(map, { type: 'cone' }, heading === undefined ? undefined : traveller?.point, heading);
  useMarker(map, { type: 'dot' }, traveller?.point);
  useMarker(map, { type: 'maneuver' }, maneuver?.point, maneuver?.heading);
  useMarker(map, { type: 'destination', icon: destination?.icon ?? 'flag' }, destination?.point);

  const stopsKey = JSON.stringify(stops);
  useEffect(() => {
    if (!map) return;
    const markers = (JSON.parse(stopsKey) as typeof stops).map((stop) =>
      new Marker({ element: createStopPin(stop.symbol, stop.color) })
        .setLngLat([stop.point[0], stop.point[1]])
        .addTo(map),
    );
    return () => markers.forEach((marker) => marker.remove());
  }, [map, stopsKey]);

  const [centerLon, centerLat] = camera.center;
  const { zoom, heading: bearing = 0, pitch = 0 } = camera;
  const paddingTop = camera.padding?.top ?? 0;
  const paddingBottom = camera.padding?.bottom ?? 0;
  const boundsKey = JSON.stringify(camera.bounds ?? null);
  useEffect(() => {
    if (!map || !following) return;
    const bounds = JSON.parse(boundsKey) as TripMapProps['camera']['bounds'] | null;
    if (bounds) {
      map.fitBounds([bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]], {
        // Room for the pins, which stand above their point.
        padding: { top: paddingTop + 64, bottom: paddingBottom + 24, left: 32, right: 32 },
        bearing: 0,
        pitch: 0,
        maxZoom: 17,
        duration: 900,
      });
      return;
    }
    map.easeTo({
      center: [centerLon, centerLat],
      zoom,
      bearing,
      pitch,
      padding: { top: paddingTop, bottom: paddingBottom, left: 0, right: 0 },
      duration: 900,
    });
  }, [
    map,
    following,
    boundsKey,
    centerLon,
    centerLat,
    zoom,
    bearing,
    pitch,
    paddingTop,
    paddingBottom,
  ]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <div
        ref={container}
        className="trip-map"
        style={{
          position: 'absolute',
          inset: 0,
          background: colors.mapGround,
          ['--controls-bottom' as string]: `${controlsBottom}px`,
        }}
      />
      {backdrop && <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.veil]} />}
      {!following && (
        <View style={[styles.recenter, { bottom: controlsBottom + 8 }]}>
          <IconButton
            icon="my_location"
            label="Ma position"
            tone="raised"
            size={64}
            iconSize={32}
            iconVariant="filled"
            onPress={() => setFollowing(true)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  veil: {
    backgroundColor: 'rgba(244,241,234,.6)',
  },
  recenter: {
    position: 'absolute',
    right: 16,
  },
});
