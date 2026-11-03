// Colour tokens of the emerald direction (D15, specs 009 and 010): one emerald accent,
// warm whites on a cream map, official line colours untouched.

export const colors = {
  // Surfaces, from lightest to darkest.
  surface: '#FBF8F6',
  /** Very pale green of rows, tiles and unselected choices (spec 010). */
  surfaceLow: '#EAF4F1',
  surfaceHigh: '#DCEBE6',
  /** Empty quarters of the duration dials. */
  surfaceHighest: '#B5CFC7',
  tonal: '#EAF4F1',

  ink: '#111827',
  inkMuted: '#6B7280',
  inkDisabled: '#9CA3AF',
  outline: '#6B7280',
  handle: 'rgba(107,114,128,.45)',
  scrim: 'rgba(0,0,0,.32)',

  // Emerald: the action colour (buttons, selection, chosen path), spec 010.
  primary: '#037C6D',
  onPrimary: '#FFFFFF',
  secondaryContainer: '#EAF4F1',
  /** Dark emerald: casing of vehicle lines, outlines on pale emerald. */
  onSecondaryContainer: '#024C43',

  // Guidance: green when all is well, orange to get off.
  /** « You are on the right way »: lighter than the emerald of actions (spec 010). */
  onTrack: '#2FBF71',
  /** Approach ring of a turn. */
  go: '#037C6D',
  alert: '#E8590C',
  /** Peach card of an alert: get off soon, no network (spec 010). */
  alertSoft: '#FDE3D3',
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

  /** Pale emerald behind what is open or waits to be chosen (spec 010). */
  accentSoft: '#EAF4F1',

  // Calm dark theme of the offline metro screen (E21).
  night: {
    background: '#121311',
    bar: '#1E1F1C',
    card: '#292A26',
    button: '#3A3B37',
    ink: '#E2E3DE',
    inkMuted: '#C8C8C1',
    buttonInk: '#E6E8E3',
    listen: '#5FD3B5',
  },
} as const;
