// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

const gpsPlugin = require('./eslint/plugin');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    // The traveller cannot read: see docs/product/principes.md.
    files: ['src/features/traveller/**/*.{ts,tsx,js,jsx}'],
    ignores: ['**/__tests__/**'],
    plugins: { gps: gpsPlugin },
    rules: { 'gps/no-text-in-traveller-ui': 'error' },
  },
  {
    ignores: ['dist/*', 'coverage/*'],
  },
]);
