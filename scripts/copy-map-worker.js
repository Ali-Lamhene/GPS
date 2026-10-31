// MapLibre's web worker is a separate file that Metro does not bundle. It is copied into
// public/ (served at the site root by Expo web) after every install, and not committed.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = path.join(root, 'node_modules', 'maplibre-gl', 'dist', 'maplibre-gl-worker.mjs');
const target = path.join(root, 'public', 'maplibre-gl-worker.mjs');

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.copyFileSync(source, target);
