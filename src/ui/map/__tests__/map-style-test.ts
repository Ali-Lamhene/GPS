import { buildFallbackStyle, buildMapStyle } from '../map-style';

describe('buildMapStyle', () => {
  const style = buildMapStyle('pmtiles://marseille');

  test('has nothing to read: no symbol layer, no glyphs, no sprite (zero text)', () => {
    expect(style.layers.some((layer) => layer.type === 'symbol')).toBe(false);
    expect(style.glyphs).toBeUndefined();
    expect(style.sprite).toBeUndefined();
  });

  test('only reads the bundled tiles, and credits OpenStreetMap', () => {
    expect(Object.values(style.sources)).toEqual([
      expect.objectContaining({
        url: 'pmtiles://marseille',
        attribution: expect.stringContaining('OpenStreetMap'),
      }),
    ]);
  });

  test('the fallback is plain ground, still without text', () => {
    expect(buildFallbackStyle().layers.map((layer) => layer.type)).toEqual(['background']);
    expect(buildFallbackStyle().sources).toEqual({});
  });
});
