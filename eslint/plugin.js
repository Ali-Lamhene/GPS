// Local ESLint plugin for project-specific rules.
module.exports = {
  meta: { name: 'eslint-plugin-gps' },
  rules: {
    'no-text-in-traveller-ui': require('./rules/no-text-in-traveller-ui'),
  },
};
