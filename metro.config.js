// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Offline map tiles of the demo zone, bundled with the app (spec 002).
config.resolver.assetExts.push('pmtiles');

module.exports = config;
