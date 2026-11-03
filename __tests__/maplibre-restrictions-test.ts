import { MAPLIBRE_NATIVE_FORBIDDEN } from '../eslint/forbidden-packages';

// The ESLint rule forbids these names in src/ui/map: each must still be a real export of
// the native map package, or a rename at an update would silently let it through.

// Node built-ins, typed here only: the app's TypeScript setup has no Node types.
const fs = jest.requireActual<{ readFileSync(path: string, encoding: 'utf8'): string }>('fs');
const path = jest.requireActual<{ join(...parts: string[]): string }>('path');
const { cwd } = jest.requireActual<{ cwd(): string }>('process');

const index = fs.readFileSync(
  path.join(cwd(), 'node_modules/@maplibre/maplibre-react-native/src/index.ts'),
  'utf8',
);

describe('MapLibre Native restrictions', () => {
  test.each(MAPLIBRE_NATIVE_FORBIDDEN)('%s is still exported by the package', (name) => {
    expect(index).toMatch(new RegExp(`^\\s*(export \\{ )?${name}[,\\s}]`, 'm'));
  });
});
