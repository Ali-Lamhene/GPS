import type { ExpressionSpecification, StyleSpecification } from 'maplibre-gl';

// Base map without any label (spec 002), in the colours of the emerald mockup (spec 009): no symbol
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
 * Warm city map of the emerald mockup (spec 009, D15): cream ground, flat soft green
 * parks, bright blue water, white streets, hatched railways.
 */
export const MAP_COLORS: MapPalette = {
  ground: '#F8F1EE',
  park: '#D6E4A4',
  civic: '#F3EAE6',
  water: '#8BCBEF',
  building: '#F1E8E4',
  buildingEdge: '#E8DDD8',
  roadCasing: '#EDE3DF',
  road: '#FFFFFF',
  majorRoad: '#FFFFFF',
  majorRoadCasing: '#E6DBD6',
  path: '#EFE6E2',
  rail: '#C9C4C5',
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
        paint: { 'line-color': palette.rail, 'line-width': width(0.5, 2) },
      },
      // Short wide dashes across the rail line: the ties of a hatched railway.
      {
        id: 'rail-ties',
        type: 'line',
        source,
        'source-layer': 'roads',
        minzoom: 14,
        filter: ['==', ['get', 'kind'], 'rail'],
        paint: {
          'line-color': palette.rail,
          'line-width': width(2, 7),
          'line-dasharray': [0.25, 1.25],
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
