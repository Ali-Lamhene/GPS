import type { ExpressionSpecification, StyleSpecification } from 'maplibre-gl';

// Base map without any label (spec 002), in the pearl colours of spec 008: no symbol
// layer, no glyphs, no sprite, so nothing to read and nothing to download. Layers follow
// the Protomaps basemap schema of the bundled archive.

export type MapPalette = Record<
  | 'ground'
  | 'park'
  | 'civic'
  | 'water'
  | 'building'
  | 'buildingEdge'
  | 'roadCasing'
  | 'road'
  | 'majorRoad'
  | 'majorRoadCasing'
  | 'path'
  | 'rail',
  string
>;

/**
 * "Pearl" base map (spec 008): cool, desaturated greys, so that only the route
 * and the markers carry colour (like the map apps the user picked as references).
 */
export const MAP_COLORS: MapPalette = {
  ground: '#EEF0F3',
  park: '#DDEEDB',
  civic: '#E8EBEF',
  water: '#C7DCF0',
  building: '#E2E5EA',
  buildingEdge: '#D5D9DF',
  roadCasing: '#DCE0E5',
  road: '#FFFFFF',
  majorRoad: '#FFFFFF',
  majorRoadCasing: '#CDD2D9',
  path: '#E0E3E8',
  rail: '#C9CED5',
};

const PARKS = [
  'park',
  'garden',
  'grass',
  'forest',
  'wood',
  'cemetery',
  'nature_reserve',
  'golf_course',
];
const CIVIC = ['school', 'university', 'hospital', 'pedestrian', 'parking'];

/** Road width in pixels by zoom, from thin at 12 to wide at 18. */
function width(at12: number, at18: number): ExpressionSpecification {
  return ['interpolate', ['exponential', 1.6], ['zoom'], 12, at12, 18, at18];
}

/** Plain ground, when the bundled tiles cannot be read: routes and markers still show. */
export function buildFallbackStyle(palette: MapPalette = MAP_COLORS): StyleSpecification {
  return {
    version: 8,
    sources: {},
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': palette.ground } },
    ],
  };
}

export function buildMapStyle(
  tilesUrl: string,
  palette: MapPalette = MAP_COLORS,
): StyleSpecification {
  const source = 'base';
  return {
    version: 8,
    sources: {
      [source]: {
        type: 'vector',
        url: tilesUrl,
        attribution: '© OpenStreetMap, Protomaps',
      },
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': palette.ground } },
      {
        id: 'parks',
        type: 'fill',
        source,
        'source-layer': 'landuse',
        filter: ['in', ['get', 'kind'], ['literal', PARKS]],
        paint: { 'fill-color': palette.park },
      },
      {
        id: 'civic',
        type: 'fill',
        source,
        'source-layer': 'landuse',
        filter: ['in', ['get', 'kind'], ['literal', CIVIC]],
        paint: { 'fill-color': palette.civic },
      },
      {
        id: 'water',
        type: 'fill',
        source,
        'source-layer': 'water',
        paint: { 'fill-color': palette.water },
      },
      {
        id: 'buildings',
        type: 'fill',
        source,
        'source-layer': 'buildings',
        minzoom: 14,
        paint: { 'fill-color': palette.building, 'fill-outline-color': palette.buildingEdge },
      },
      {
        id: 'paths',
        type: 'line',
        source,
        'source-layer': 'roads',
        minzoom: 15,
        filter: ['==', ['get', 'kind'], 'path'],
        paint: { 'line-color': palette.path, 'line-width': width(0.5, 3) },
      },
      {
        id: 'rail',
        type: 'line',
        source,
        'source-layer': 'roads',
        filter: ['==', ['get', 'kind'], 'rail'],
        paint: {
          'line-color': palette.rail,
          'line-width': width(0.5, 2),
          'line-dasharray': [3, 2],
        },
      },
      {
        id: 'roads-casing',
        type: 'line',
        source,
        'source-layer': 'roads',
        filter: ['in', ['get', 'kind'], ['literal', ['minor_road', 'medium_road']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': palette.roadCasing, 'line-width': width(1.5, 18) },
      },
      {
        id: 'major-roads-casing',
        type: 'line',
        source,
        'source-layer': 'roads',
        filter: ['in', ['get', 'kind'], ['literal', ['major_road', 'highway']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': palette.majorRoadCasing, 'line-width': width(2.5, 26) },
      },
      {
        id: 'roads',
        type: 'line',
        source,
        'source-layer': 'roads',
        filter: ['in', ['get', 'kind'], ['literal', ['minor_road', 'medium_road']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': palette.road, 'line-width': width(1, 15) },
      },
      {
        id: 'major-roads',
        type: 'line',
        source,
        'source-layer': 'roads',
        filter: ['in', ['get', 'kind'], ['literal', ['major_road', 'highway']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': palette.majorRoad, 'line-width': width(2, 22) },
      },
    ],
  };
}
