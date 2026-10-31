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
];

module.exports = { FORBIDDEN_PACKAGES };
