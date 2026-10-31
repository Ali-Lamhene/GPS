// Colour tokens: mockup v7 (D11), made more vivid by spec 002 (white surfaces, brighter
// blue, emerald guidance, stronger orange).

export const colors = {
  // Surfaces, from lightest to darkest.
  surface: '#FCFCFA',
  surfaceLow: '#F6F6F3',
  surfaceContainer: '#F0F1EC',
  surfaceHigh: '#E9EAE5',
  surfaceHighest: '#E2E3DE',
  tonal: '#E6E8E3',

  ink: '#1B1C1A',
  inkMuted: '#474843',
  inkDisabled: '#9A9A93',
  inkFaint: 'rgba(27,28,26,.38)',
  outline: '#787872',
  outlineVariant: '#C8C8C1',
  handle: 'rgba(120,120,114,.45)',
  scrim: 'rgba(0,0,0,.32)',

  // Blue: the action colour (buttons, selection, chosen path).
  primary: '#1E6BFF',
  onPrimary: '#FFFFFF',
  primaryTint: '#EAF1FF',
  primaryHalo: 'rgba(30,107,255,.16)',
  secondaryContainer: '#DCE8FF',
  onSecondaryContainer: '#0B2A5C',
  tertiaryContainer: '#DCE7F7',
  onTertiaryContainer: '#2B5FC9',

  // Guidance instruction card: green when all is well, orange to get off.
  guidance: '#078A57',
  alert: '#E8590C',
  success: '#2E7D4F',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  white: '#FFFFFF',
  whiteGlass: 'rgba(255,255,255,.16)',
  blackGlass: 'rgba(0,0,0,.4)',

  // Drawn maps.
  mapGround: '#ECEDE8',
  mapGroundHome: '#EEEFEA',
  mapStreet: '#FFFFFF',
  mapStreetEdge: '#E3E4DF',
  mapPark: '#DDE9D6',
  mapParkDot: '#CFE0C6',
  mapWater: '#D3E2EE',
  mapVeil: 'rgba(252,252,250,.35)',
  route: '#1E6BFF',
  routeHalo: 'rgba(59,111,216,.22)',
  accuracy: 'rgba(31,111,229,.12)',
  accuracyEdge: 'rgba(31,111,229,.35)',
  holdTrack: '#D5D6D0',
  car: '#5E6670',
  walkRail: '#A8A8A1',

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
