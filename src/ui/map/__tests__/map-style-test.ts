import { buildMapStyle } from '../map-style';

describe('buildMapStyle', () => {
  const style = buildMapStyle('https://tiles.example/planet', '© OpenStreetMap');

  test('has nothing to read: no symbol layer, no glyphs, no sprite (zero text)', () => {
    expect(style.layers.some((layer) => layer.type === 'symbol')).toBe(false);
    expect(style.glyphs).toBeUndefined();
    expect(style.sprite).toBeUndefined();
  });

  test('reads only the given tiles, and carries their credit (spec 017)', () => {
    expect(Object.values(style.sources)).toEqual([
      expect.objectContaining({
        url: 'https://tiles.example/planet',
        attribution: '© OpenStreetMap',
      }),
    ]);
  });

  test('draws the OpenMapTiles layers: water, parks, buildings, streets', () => {
    const layers = style.layers.flatMap((layer) =>
      'source-layer' in layer ? [layer['source-layer']] : [],
    );
    expect(new Set(layers)).toEqual(
      new Set(['landcover', 'park', 'landuse', 'water', 'building', 'transportation']),
    );
  });
});
