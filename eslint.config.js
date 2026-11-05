// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

const { FORBIDDEN_PACKAGES, MAPLIBRE_NATIVE_FORBIDDEN } = require('./eslint/forbidden-packages');
const gpsPlugin = require('./eslint/plugin');

// Packages that can reach the network or the speech engine, each wrapped by one module.
const WRAPPED_PACKAGES = [
  {
    name: 'expo-audio',
    message:
      'Play sounds through src/services/feedback.ts: it only plays bundled files (securite.md).',
  },
  {
    name: 'expo-speech',
    message: 'Speak through src/services/speech.ts: it refuses network voices (securite.md, D1).',
  },
  {
    name: 'maplibre-gl',
    message: 'Use the TripMap component (src/ui/map): it only calls the tiles host (spec 017).',
  },
  {
    name: '@maplibre/maplibre-react-native',
    message: 'Use the TripMap component (src/ui/map): it only calls the tiles host (spec 017).',
  },
  {
    name: 'expo-location',
    message: 'Locate through src/services/location.ts: foreground only (spec 017).',
  },
  {
    name: 'expo-network',
    message: 'Read the network state through src/services/network.ts (spec 017).',
  },
  {
    name: 'expo-image-picker',
    message: 'Pick photos through src/services/photo.ts: metadata dropped (spec 020).',
  },
  {
    name: 'expo-image-manipulator',
    message: 'Re-encode photos through src/services/photo.ts (spec 020).',
  },
  // Opening a URL can send a place to a third party (geo:, tel:, a maps site): never with
  // these; react-native's Linking is limited below (spec 024).
  {
    name: 'expo-linking',
    message: 'Open URLs through src/services/credits.ts, fixed pages only (spec 024, securite.md).',
  },
  {
    name: 'expo-web-browser',
    message: 'Open URLs through src/services/credits.ts, fixed pages only (spec 024, securite.md).',
  },
];

/** The no-restricted-imports rule, minus the wrapped packages a module is allowed to use. */
function restrictedImports(allow = [], allowedMapNames = [], allowTesting = false) {
  const wrapped = WRAPPED_PACKAGES.filter(({ name }) => !allow.includes(name));
  return [
    'error',
    {
      paths: [
        ...wrapped,
        ...(allow.includes('Linking')
          ? []
          : [
              {
                name: 'react-native',
                importNames: ['Linking'],
                message:
                  'Open URLs through src/services/credits.ts (fixed pages, spec 024) or location.ts (settings), securite.md.',
              },
            ]),
        {
          name: 'react-native-svg',
          importNames: ['SvgUri', 'SvgCssUri', 'SvgFromUri', 'UriProps'],
          message:
            'These download a remote URL outside src/services/ (docs/engineering/securite.md).',
        },
        ...(allow.includes('@maplibre/maplibre-react-native')
          ? [
              {
                name: '@maplibre/maplibre-react-native',
                importNames: MAPLIBRE_NATIVE_FORBIDDEN.filter(
                  (name) => !allowedMapNames.includes(name),
                ),
                message:
                  'Downloads tiles, rewrites requests, loads remote images or starts location (securite.md).',
              },
            ]
          : []),
        ...(allow.includes('expo-network')
          ? [
              {
                name: 'expo-network',
                importNames: ['getIpAddressAsync'],
                message: 'On the web it calls api.ipify.org with the IP address (spec 017).',
              },
            ]
          : []),
      ],
      patterns: [
        {
          group: FORBIDDEN_PACKAGES,
          message:
            'This SDK sends device or usage data to a third party, forbidden by D1 (docs/product/decisions.md).',
        },
        ...wrapped.map(({ name, message }) => ({ group: [`${name}/*`], message })),
        {
          group: ['@maplibre/*', '!@maplibre/maplibre-react-native'],
          message: 'Native maps need their own security review first (spec 002).',
        },
        {
          group: ['@maplibre/maplibre-react-native/*'],
          message: 'Import the reviewed entry point only (securite.md).',
        },
        // Test fixtures (fake places, a Marseille trip) never reach the app, not even in
        // development: the app starts empty.
        ...(allowTesting
          ? []
          : [
              {
                group: [
                  '@/testing',
                  '@/testing/**',
                  '**/testing',
                  '**/testing/**',
                  // Test files may import the fixtures, so the app may not import them either.
                  '**/__tests__',
                  '**/__tests__/**',
                ],
                message: 'Test fixtures and helpers stay out of the app (src/testing/).',
              },
            ]),
      ],
    },
  ];
}

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    // Security and code rules: see docs/engineering/securite.md and code.md.
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    rules: {
      // Logs can leak positions and places (adb logcat, crash dumps).
      'no-console': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-imports': restrictedImports(),
    },
  },
  {
    // The app starts empty, even in development: no fixture reaches it through a dynamic
    // import or require, nor through a `fixture` prop written inline (skips the routing).
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    ignores: ['src/**/__tests__/**', 'src/testing/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ImportExpression[source.value=/(^|\\/)(testing|__tests__)(\\/|$)/]',
          message: 'Test fixtures and helpers stay out of the app (src/testing/).',
        },
        {
          selector:
            "CallExpression[callee.name='require'][arguments.0.value=/(^|\\/)(testing|__tests__)(\\/|$)/]",
          message: 'Test fixtures and helpers stay out of the app (src/testing/).',
        },
        {
          selector: "JSXAttribute[name.name='fixture']",
          message: 'Fixed places and trips are for tests only: the app never fakes a trip.',
        },
      ],
    },
  },
  // Each module that wraps a restricted package may import that package only; every other
  // restriction, tracking SDKs included, still applies to it.
  {
    files: ['src/services/feedback.ts'],
    rules: { 'no-restricted-imports': restrictedImports(['expo-audio']) },
  },
  {
    files: ['src/services/speech.ts'],
    rules: { 'no-restricted-imports': restrictedImports(['expo-speech']) },
  },
  {
    files: ['src/services/location.ts'],
    // Linking opens the phone's location settings, nothing else.
    rules: { 'no-restricted-imports': restrictedImports(['expo-location', 'Linking']) },
  },
  {
    files: ['src/services/credits.ts'],
    rules: { 'no-restricted-imports': restrictedImports(['Linking']) },
  },
  {
    files: ['src/services/photo.ts'],
    rules: {
      'no-restricted-imports': restrictedImports(['expo-image-picker', 'expo-image-manipulator']),
    },
  },
  {
    files: ['src/services/network.ts'],
    rules: { 'no-restricted-imports': restrictedImports(['expo-network']) },
  },
  {
    files: ['src/ui/map/**'],
    rules: {
      'no-restricted-imports': restrictedImports([
        'maplibre-gl',
        '@maplibre/maplibre-react-native',
      ]),
    },
  },
  {
    // Only here: locks requests to the tiles host and wipes the tile cache (spec 017).
    files: ['src/ui/map/native-map-setup.ts'],
    rules: {
      'no-restricted-imports': restrictedImports(
        ['maplibre-gl', '@maplibre/maplibre-react-native'],
        ['TransformRequestManager', 'OfflineManager'],
      ),
    },
  },
  {
    // Tests mock the wrapped packages and use the fixtures of src/testing/.
    files: ['src/**/__tests__/**', 'src/testing/**'],
    rules: {
      'no-restricted-imports': restrictedImports(
        [
          'expo-audio',
          'expo-speech',
          'maplibre-gl',
          'expo-location',
          'expo-network',
          '@maplibre/maplibre-react-native',
          'Linking',
        ],
        ['TransformRequestManager', 'OfflineManager'],
        true,
      ),
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
  {
    // The traveller cannot read: see docs/product/principes.md.
    files: ['src/features/traveller/**/*.{ts,tsx,js,jsx}', 'src/ui/**/*.{ts,tsx,js,jsx}'],
    ignores: [
      '**/__tests__/**',
      // Draws Material Symbols glyphs through a font: pictograms, not text.
      'src/ui/icon/icon.tsx',
      // The only text the traveller sees, decision D9 (docs/product/decisions.md).
      'src/features/traveller/components/line-badge.tsx',
      'src/features/traveller/components/station-name.tsx',
      'src/features/traveller/help/help-message.tsx',
      'src/ui/map/map-texts.tsx',
    ],
    plugins: { gps: gpsPlugin },
    rules: { 'gps/no-text-in-traveller-ui': 'error' },
  },
  {
    // Development scripts run in Node.
    files: ['scripts/**/*.js', 'metro.config.js'],
    languageOptions: { globals: { Buffer: 'readonly', __dirname: 'readonly' } },
  },
  {
    // Generated by the Expo dev server, not committed.
    ignores: ['dist/*', 'coverage/*', '.expo/*', 'expo-env.d.ts'],
  },
]);
