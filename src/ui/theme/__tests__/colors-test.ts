import { colors } from '../colors';

/** WCAG relative luminance of a #RRGGBB colour. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

describe('action colours', () => {
  // The traveller sees no text: icons are graphics, for which WCAG asks 3:1.
  test('the emerald carries white icons', () => {
    expect(contrast(colors.primary, colors.onPrimary)).toBeGreaterThanOrEqual(3);
    expect(contrast(colors.emerald, colors.white)).toBeGreaterThanOrEqual(3);
  });

  test('the emerald pictograms read on warm white', () => {
    expect(contrast(colors.emerald, colors.warmWhite)).toBeGreaterThanOrEqual(3);
  });
});
