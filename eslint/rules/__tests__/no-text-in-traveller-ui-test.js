/**
 * @jest-environment node
 */
const { RuleTester } = require('eslint');

const rule = require('../no-text-in-traveller-ui');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('no-text-in-traveller-ui', rule, {
  valid: [
    "import { View, Pressable } from 'react-native';",
    "import { Text } from 'some-other-lib';",
    '<View>\n  <Arrow />\n</View>',
    '<Pressable accessibilityLabel="Appeler à l\'aide"><PhoneIcon /></Pressable>',
    '<View>{direction}</View>',
    '<Gauge value={0.5} />',
  ],
  invalid: [
    {
      code: "import { Text, View } from 'react-native';",
      errors: [{ messageId: 'textComponent' }],
    },
    {
      code: "import { TextInput } from 'react-native';",
      errors: [{ messageId: 'textComponent' }],
    },
    {
      code: '<View>Tournez à gauche</View>',
      errors: [{ messageId: 'literalText' }],
    },
    {
      code: "<View>{'200 m'}</View>",
      errors: [{ messageId: 'literalText' }],
    },
    {
      code: '<View>{200}</View>',
      errors: [{ messageId: 'literalText' }],
    },
    {
      code: '<>{`${minutes} min`}</>',
      errors: [{ messageId: 'literalText' }],
    },
  ],
});
