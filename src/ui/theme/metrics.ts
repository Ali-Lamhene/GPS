// Spacing, radius, size and elevation tokens of the « clair premium » system (spec 008).

export const spacing = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  /** Gap between a floating card and the screen edges (spec 008). */
  gutter: 14,
} as const;

// Corners of the « clair premium » system (spec 008): soft rounded controls, large floating
// cards, pills and discs.
export const radii = {
  /** Square line ids: the shape of the network signs they are compared with (D9). */
  sign: 8,
  /** Buttons, tiles, rows, banners. */
  control: 16,
  /** Cards floating over the map, sheets included. */
  sheet: 28,
  /** Square place tiles of the emerald home (spec 009). */
  tile: 18,
  /** Big place cards of the home carousel. */
  placeCard: 26,
} as const;

export const sizes = {
  /** Round header buttons: back, close, home, help, at the size of the mockups (spec 010). */
  headerButton: 44,
  /** Height of the emerald action pill (spec 010). */
  actionPill: 56,
} as const;

export const shadows = {
  medium: '0 2px 4px rgba(17,24,39,.10), 0 4px 12px rgba(17,24,39,.08)',
  card: '0 2px 6px rgba(17,24,39,.06), 0 8px 20px rgba(17,24,39,.08)',
  floating: '0 4px 14px rgba(17,24,39,.16)',
  sheet: '0 12px 32px rgba(17,24,39,.14), 0 2px 6px rgba(17,24,39,.06)',
  marker: '0 1px 4px rgba(0,0,0,.3)',
  /** Large soft shadow of the cards floating over the map (spec 008). */
  float: '0 12px 32px rgba(17,24,39,.14), 0 2px 6px rgba(17,24,39,.06)',
  /** Soft warm shadow of the round buttons and the pill of the emerald mockup (spec 009). */
  warm: '0 2px 8px rgba(60,40,30,.16)',
  /** Glow under the emerald « + » and pill (spec 009). */
  emerald: '0 6px 16px rgba(3,124,109,.35)',
  /** Glow under the emerald pill (spec 010). */
  accent: '0 6px 16px rgba(3,124,109,.35)',
} as const;
