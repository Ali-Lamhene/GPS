import type { PlaceCategory } from '@/domain/place-category';

// Colour tokens of the « clair premium » system (spec 008). The emerald mockup (D15)
// replaces them with the visual redesign.

export const colors = {
  // Surfaces, from lightest to darkest.
  surface: '#F9FAFB',
  surfaceLow: '#F3F4F6',
  surfaceHigh: '#E5E7EB',
  surfaceHighest: '#D1D5DB',
  tonal: '#E5E7EB',

  ink: '#111827',
  inkMuted: '#6B7280',
  inkDisabled: '#9CA3AF',
  outline: '#6B7280',
  handle: 'rgba(107,114,128,.45)',
  scrim: 'rgba(0,0,0,.32)',

  // Blue: the action colour (buttons, selection, chosen path).
  primary: '#2F6BFF',
  onPrimary: '#FFFFFF',
  secondaryContainer: '#DCE6FF',
  onSecondaryContainer: '#0B2A5C',

  // Guidance: green when all is well, orange to get off.
  /** Bright green of the approach ring, on the dark instruction pill (spec 008). */
  go: '#22C55E',
  alert: '#E8590C',
  success: '#2E7D4F',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  white: '#FFFFFF',
  whiteGlass: 'rgba(255,255,255,.16)',
  /** Large faded pictogram running off the corner of an illustrated tile. */
  whiteFaded: 'rgba(255,255,255,.22)',
  blackGlass: 'rgba(0,0,0,.4)',

  // Emerald mockup (D15, spec 009): one accent for places, the traveller and actions on
  // the home; other screens move to it with their own specs.
  emerald: '#037C6D',
  /** Pale ring of the end to fill and of the traveller's position. */
  emeraldHalo: '#B4D8D1',
  /** Warm white of the floating pill, panel and buttons. */
  warmWhite: '#FBF8F6',
  /** Thin warm edge of white tiles and buttons on the cream map. */
  warmEdge: '#EBE3DF',
  emeraldGlow: 'rgba(3,124,109,.35)',

  // Map screens (the base map itself is styled in src/ui/map/map-style.ts).
  mapGround: '#F8F1EE',
  accuracy: 'rgba(3,124,109,.16)',
  accuracyEdge: 'rgba(3,124,109,.4)',
  car: '#5E6670',
  walkRail: '#A8A8A1',

  /**
   * Vivid colour of each family of places (spec 008): a diagonal gradient from a bright
   * hue to a deep one. Both ends keep a white pictogram readable in the sun, at least 3:1
   * (checked by a test).
   */
  vivid: {
    home: ['#F2601F', '#C93A08'],
    family: ['#F23E70', '#BE1655'],
    health: ['#0FA396', '#077169'],
    admin: ['#7262FF', '#4232D2'],
    studies: ['#18A85C', '#0C7A40'],
    work: ['#9A5CFF', '#6528D0'],
    shopping: ['#E07A00', '#B04A00'],
    leisure: ['#1294E0', '#0864B8'],
    other: ['#3D7BFF', '#1F4FD8'],
  } satisfies Record<PlaceCategory, readonly [string, string]>,
  /** The deep end of each family colour, for a single colour (chips, pin edges, shadows). */
  category: {
    home: '#C93A08',
    family: '#BE1655',
    health: '#077169',
    admin: '#4232D2',
    studies: '#0C7A40',
    work: '#6528D0',
    shopping: '#B04A00',
    leisure: '#0864B8',
    other: '#1F4FD8',
  } satisfies Record<PlaceCategory, string>,
  /** Light blue behind what waits to be chosen (spec 008). */
  accentSoft: '#E8EEFF',
  /** Empty, not yet calling: dashed grey ring. */
  emptyRing: '#C7CBD1',

  // Calm dark theme of the offline metro screen (E21).
  night: {
    background: '#121311',
    bar: '#1E1F1C',
    card: '#292A26',
    button: '#3A3B37',
    ink: '#E2E3DE',
    inkMuted: '#C8C8C1',
    buttonInk: '#E6E8E3',
    listen: '#8AB4F8',
  },
} as const;
