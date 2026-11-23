// Play Console: `orientation: portrait` makes Google Play infer a required
// `android.hardware.screen.portrait` feature, which blocks the closed test review. The app
// still runs in portrait; the feature is only declared optional so no device is excluded.
const { withAndroidManifest } = require('expo/config-plugins');

const FEATURE = 'android.hardware.screen.portrait';

module.exports = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const features = (manifest['uses-feature'] ?? []).filter(
      (item) => item.$['android:name'] !== FEATURE,
    );
    features.push({ $: { 'android:name': FEATURE, 'android:required': 'false' } });
    manifest['uses-feature'] = features;
    return config;
  });
