import type { PlaceCategory } from '@/domain/place-category';

// Colour tokens: mockup v7 (D11), made more vivid by spec 002, then the cooler palette of
// the home lab chosen with spec 007 (blue #2F6BFF, ink #111827, grey #F3F4F6).

export const colors = {
  // Surfaces, from lightest to darkest.
  surface: '#F9FAFB',
  surfaceLow: '#F3F4F6',
  surfaceContainer: '#F3F4F6',
  surfaceHigh: '#E5E7EB',
  surfaceHighest: '#D1D5DB',
  tonal: '#E5E7EB',

  ink: '#111827',
  inkMuted: '#6B7280',
  inkDisabled: '#9CA3AF',
  inkFaint: 'rgba(17,24,39,.38)',
  outline: '#6B7280',
  /** Edges of targets (place tiles, trip ends): kept visible in the sun. */
  outlineVariant: '#C4C8CF',
  handle: 'rgba(107,114,128,.45)',
  scrim: 'rgba(0,0,0,.32)',

  // Blue: the action colour (buttons, selection, chosen path).
  primary: '#2F6BFF',
  onPrimary: '#FFFFFF',
  primaryTint: '#E8EEFF',
  secondaryContainer: '#DCE6FF',
  onSecondaryContainer: '#0B2A5C',
  tertiaryContainer: '#DCE6FF',
  onTertiaryContainer: '#2B5FC9',

  // Guidance instruction card: green when all is well, orange to get off.
  guidance: '#078A57',
  alert: '#E8590C',
  success: '#2E7D4F',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  white: '#FFFFFF',
  whiteGlass: 'rgba(255,255,255,.16)',
  /** Large faded pictogram running off the corner of an illustrated tile. */
  whiteFaded: 'rgba(255,255,255,.22)',
  blackGlass: 'rgba(0,0,0,.4)',

  // Map screens (the base map itself is styled in src/ui/map/map-style.ts).
  mapGround: '#F4F1EA',
  accuracy: 'rgba(47,107,255,.12)',
  accuracyEdge: 'rgba(47,107,255,.35)',
  holdTrack: '#E5E7EB',
  car: '#5E6670',
  walkRail: '#A8A8A1',

  /**
   * One colour per family of places (spec 007), dark enough for a white pictogram to keep
   * a contrast of at least 3:1 in the sun (checked by a test).
   */
  category: {
    home: '#D9541A',
    family: '#D6456A',
    health: '#0E8A86',
    admin: '#5B50E0',
    studies: '#1F8A4D',
    work: '#7C4DDB',
    shopping: '#B86A00',
    leisure: '#0B7FA8',
    other: '#2F6BFF',
  } satisfies Record<PlaceCategory, string>,

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
