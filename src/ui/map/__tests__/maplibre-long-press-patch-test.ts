// The install script that lets a long press on a marker reach the map (spec 037).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const script = require('../../../../scripts/patch-maplibre-long-press') as {
  patch: (source: string) => string;
  MARK: string;
  installedIsPatched: () => boolean;
};
const { patch, MARK } = script;

const ORIGINAL = [
  '    override fun onMapLongClick(latLng: LatLng): Boolean {',
  '        val screenPoint = mapLibreMap!!.projection.toScreenLocation(latLng)',
  '',
  '        if (markerViewManager?.isPointInsideMarker(screenPoint) == true) {',
  '            return true',
  '        }',
  '',
  '        screenPoint.x /= this.displayDensity',
].join('\n');

describe('MapLibre long press patch (spec 037)', () => {
  test('removes the early return of a long press on a marker, once', () => {
    const patched = patch(ORIGINAL);

    expect(patched).not.toContain('isPointInsideMarker');
    expect(patched).toContain(MARK);
    expect(patch(patched)).toBe(patched);
  });

  test('stops the install when the library changed', () => {
    expect(() => patch('override fun onMapLongClick() {}')).toThrow(/spec 037/);
  });

  test('the installed library is patched (postinstall)', () => {
    expect(script.installedIsPatched()).toBe(true);
  });
});
