// Chains Reanimated's resolver (web build of Reanimated and Worklets under Jest) with
// the resolver of the jest-expo preset.
const presetResolver = require('@react-native/jest-preset/jest/resolver');
const reanimatedResolver = require('react-native-reanimated/jest/resolver');

module.exports = (request, options) =>
  reanimatedResolver(request, {
    ...options,
    defaultResolver: (req, opts) =>
      presetResolver(req, { ...opts, defaultResolver: options.defaultResolver }),
  });
