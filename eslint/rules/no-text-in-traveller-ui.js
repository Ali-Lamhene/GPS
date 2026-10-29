// The traveller cannot read: their interface must not display any text.
// See docs/product/principes.md.

const TEXT_COMPONENTS = new Set(['Text', 'TextInput']);

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid displayed text in the traveller interface (src/features/traveller/).',
    },
    schema: [],
    messages: {
      textComponent:
        "'{{name}}' displays text. The traveller interface must use pictograms, colour, sound and vibration instead.",
      literalText:
        'Text in JSX is displayed to the traveller, who cannot read. Use a pictogram, colour, sound or vibration instead.',
    },
  },

  create(context) {
    function isJsxChild(node) {
      return node.parent?.type === 'JSXElement' || node.parent?.type === 'JSXFragment';
    }

    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'react-native') return;
        for (const specifier of node.specifiers) {
          if (
            specifier.type === 'ImportSpecifier' &&
            TEXT_COMPONENTS.has(specifier.imported.name)
          ) {
            context.report({
              node: specifier,
              messageId: 'textComponent',
              data: { name: specifier.imported.name },
            });
          }
        }
      },

      JSXText(node) {
        if (node.value.trim() !== '') {
          context.report({ node, messageId: 'literalText' });
        }
      },

      JSXExpressionContainer(node) {
        if (!isJsxChild(node)) return;
        const { expression } = node;
        const isLiteral =
          (expression.type === 'Literal' &&
            (typeof expression.value === 'string' || typeof expression.value === 'number')) ||
          expression.type === 'TemplateLiteral';
        if (isLiteral) {
          context.report({ node, messageId: 'literalText' });
        }
      },
    };
  },
};
