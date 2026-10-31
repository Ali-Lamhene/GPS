// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

const { FORBIDDEN_PACKAGES } = require('./eslint/forbidden-packages');
const gpsPlugin = require('./eslint/plugin');

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
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: FORBIDDEN_PACKAGES,
              message:
                'This SDK sends device or usage data to a third party, forbidden by D1 (docs/product/decisions.md).',
            },
          ],
        },
      ],
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
    files: ['src/features/traveller/**/*.{ts,tsx,js,jsx}'],
    ignores: ['**/__tests__/**'],
    plugins: { gps: gpsPlugin },
    rules: { 'gps/no-text-in-traveller-ui': 'error' },
  },
  {
    ignores: ['dist/*', 'coverage/*'],
  },
]);
