import type { ExpressionSpecification, StyleSpecification } from 'maplibre-gl';

// "Light and warm" base map without any label (spec 002): no symbol layer, no glyphs,
// no sprite, so nothing to read and nothing to download. Layers follow the Protomaps
// basemap schema of the bundled archive.

export const MAP_COLORS = {
  ground: '#F4F1EA',
  park: '#CDEABD',
  civic: '#EFE8DA',
  water: '#9FD3F4',
  building: '#E7E1D5',
  buildingEdge: '#D9D0C1',
  roadCasing: '#DCD4C6',
  road: '#FFFFFF',
  majorRoad: '#FFF3D6',
  majorRoadCasing: '#E8CF9E',
  path: '#E4DCCD',
  rail: '#C4BCAE',
} as const;

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
export function buildFallbackStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {},
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': MAP_COLORS.ground } },
    ],
  };
}

export function buildMapStyle(tilesUrl: string): StyleSpecification {
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
      { id: 'background', type: 'background', paint: { 'background-color': MAP_COLORS.ground } },
      {
        id: 'parks',
        type: 'fill',
        source,
        'source-layer': 'landuse',
        filter: ['in', ['get', 'kind'], ['literal', PARKS]],
        paint: { 'fill-color': MAP_COLORS.park },
      },
      {
        id: 'civic',
        type: 'fill',
        source,
        'source-layer': 'landuse',
        filter: ['in', ['get', 'kind'], ['literal', CIVIC]],
        paint: { 'fill-color': MAP_COLORS.civic },
      },
      {
        id: 'water',
        type: 'fill',
        source,
        'source-layer': 'water',
        paint: { 'fill-color': MAP_COLORS.water },
      },
      {
        id: 'buildings',
        type: 'fill',
        source,
        'source-layer': 'buildings',
        minzoom: 14,
        paint: { 'fill-color': MAP_COLORS.building, 'fill-outline-color': MAP_COLORS.buildingEdge },
      },
      {
        id: 'paths',
        type: 'line',
        source,
        'source-layer': 'roads',
        minzoom: 15,
        filter: ['==', ['get', 'kind'], 'path'],
        paint: { 'line-color': MAP_COLORS.path, 'line-width': width(0.5, 3) },
      },
      {
        id: 'rail',
        type: 'line',
        source,
        'source-layer': 'roads',
        filter: ['==', ['get', 'kind'], 'rail'],
        paint: {
          'line-color': MAP_COLORS.rail,
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
        paint: { 'line-color': MAP_COLORS.roadCasing, 'line-width': width(1.5, 18) },
      },
      {
        id: 'major-roads-casing',
        type: 'line',
        source,
        'source-layer': 'roads',
        filter: ['in', ['get', 'kind'], ['literal', ['major_road', 'highway']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': MAP_COLORS.majorRoadCasing, 'line-width': width(2.5, 26) },
      },
      {
        id: 'roads',
        type: 'line',
        source,
        'source-layer': 'roads',
        filter: ['in', ['get', 'kind'], ['literal', ['minor_road', 'medium_road']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': MAP_COLORS.road, 'line-width': width(1, 15) },
      },
      {
        id: 'major-roads',
        type: 'line',
        source,
        'source-layer': 'roads',
        filter: ['in', ['get', 'kind'], ['literal', ['major_road', 'highway']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': MAP_COLORS.majorRoad, 'line-width': width(2, 22) },
      },
    ],
  };
}
