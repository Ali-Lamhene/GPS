// Packages that send device or usage data to a third party: analytics, crash
// reporting, ads, push or remote config SDKs. Forbidden by decision D1
// (docs/product/decisions.md) and docs/engineering/securite.md.
// Used by eslint.config.js (imports) and __tests__/forbidden-dependencies-test.ts
// (package.json), so a native SDK cannot sneak in through autolinking either.

/** Glob patterns, in the gitignore syntax of ESLint's `no-restricted-imports`. */
const FORBIDDEN_PACKAGES = [
  '@sentry/*',
  'sentry-expo',
  '@bugsnag/*',
  '@datadog/*',
  '@react-native-firebase/*',
  'firebase',
  'firebase/*',
  '@segment/*',
  '@amplitude/*',
  'mixpanel-react-native',
  'posthog-react-native',
  '@microsoft/applicationinsights-*',
  'react-native-onesignal',
  'onesignal-expo-plugin',
  'react-native-google-mobile-ads',
  'react-native-fbsdk-next',
  'expo-insights',
  'expo-observe',
  'expo-tracking-transparency',
  // Checks an Expo server at each launch (securite.md §2): no spec needs it yet.
  'expo-updates',
  // Map SDKs easy to mistake for MapLibre: Mapbox telemetry, Google Maps SDK.
  '@rnmapbox/maps',
  'react-native-maps',
];

/**
 * Parts of the native map library that download, write or locate, refused even in
 * src/ui/map (security review of the native map, 2026-11-03). A test checks that each
 * name is still exported by the package, so a rename cannot silently reopen it.
 */
const MAPLIBRE_NATIVE_FORBIDDEN = [
  'OfflineManager',
  'OfflinePack',
  'StaticMapImageManager',
  'TransformRequestManager',
  'LocationManager',
  'UserLocation',
  'NativeUserLocation',
  'useCurrentPosition',
  'VectorSource',
  'RasterSource',
  'RasterDEMSource',
  'ImageSource',
  'Images',
];

module.exports = { FORBIDDEN_PACKAGES, MAPLIBRE_NATIVE_FORBIDDEN };
