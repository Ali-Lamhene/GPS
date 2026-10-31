// Spacing, radius, size and elevation tokens from the mockup v7 (decision D11).

export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const radii = {
  xs: 8,
  sm: 12,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
  full: 999,
} as const;

export const sizes = {
  /** Round header buttons: back, close, home, help. */
  headerButton: 56,
  /** Square action buttons of the guidance panel. */
  actionButton: 72,
  /** Main action disc. */
  mainAction: 96,
  /** Smallest target for the traveller (docs/product/principes.md). */
  minTarget: 64,
} as const;

export const shadows = {
  low: '0 1px 2px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06)',
  medium: '0 1px 2px rgba(0,0,0,.14), 0 3px 8px rgba(0,0,0,.08)',
  card: '0 1px 2px rgba(0,0,0,.10), 0 4px 12px rgba(0,0,0,.06)',
  raised: '0 2px 10px rgba(0,0,0,.14)',
  floating: '0 2px 10px rgba(0,0,0,.16)',
  sheet: '0 -1px 3px rgba(0,0,0,.08)',
  marker: '0 1px 4px rgba(0,0,0,.3)',
} as const;
