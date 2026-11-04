// Spec 020: expo-camera bundles Google ML Kit (barcode and document scanners) by default, which
// reports device and usage data to Google. The app only takes photos: both are left out.
const { withGradleProperties } = require('expo/config-plugins');

const OFF = ['expo.camera.barcode-scanner-enabled', 'expo.camera.document-scanner-enabled'];

module.exports = (config) =>
  withGradleProperties(config, (config) => {
    for (const key of OFF) {
      config.modResults = config.modResults.filter(
        (item) => !(item.type === 'property' && item.key === key),
      );
      config.modResults.push({ type: 'property', key, value: 'false' });
    }
    return config;
  });
