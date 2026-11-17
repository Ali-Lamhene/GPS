// Spec 037: a long press on a place pin changes the place. On Android, MapLibre Native
// 11.5.1 drops a long press made on a marker (`onMapLongClick` returns early when the finger
// is inside one), so neither the marker nor the map hears it. This removes that early return
// after every install: the map's `onLongPress` then fires, and the app finds the pin under the
// finger (src/ui/map/pin-hit.ts). A short touch is untouched. Needs a new native build.
// Fails the install if the library changed, so the patch is never silently lost.
const fs = require('fs');
const path = require('path');

const FILE = path.join(
  __dirname,
  '..',
  'node_modules/@maplibre/maplibre-react-native/android/src/main/java/org/maplibre/reactnative/components/mapview/MLRNMapView.kt',
);

const SWALLOW = [
  '        if (markerViewManager?.isPointInsideMarker(screenPoint) == true) {',
  '            return true',
  '        }',
  '',
].join('\n');

const MARK = '        // Yalla map (spec 037): a long press on a marker reaches the map too.\n';

/** The Kotlin source with the early return removed; throws if it is not found. */
function patch(source) {
  if (source.includes(MARK)) return source;
  const first = source.indexOf(SWALLOW);
  if (first < 0 || source.indexOf(SWALLOW, first + 1) >= 0) {
    throw new Error(
      'patch-maplibre-long-press: MLRNMapView.kt changed, review spec 037 before upgrading',
    );
  }
  return source.replace(SWALLOW, MARK);
}

if (require.main === module) {
  const source = fs.readFileSync(FILE, 'utf8');
  const patched = patch(source);
  if (patched !== source) fs.writeFileSync(FILE, patched);
}

/** Whether the library installed in node_modules carries the patch. */
function installedIsPatched() {
  const source = fs.readFileSync(FILE, 'utf8');
  return source.includes(MARK) && !source.includes(SWALLOW);
}

module.exports = { patch, MARK, installedIsPatched };
