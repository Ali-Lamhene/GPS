import { FORBIDDEN_PACKAGES } from '../eslint/forbidden-packages';
import packageJson from '../package.json';

// Same glob syntax as ESLint's no-restricted-imports: `*` matches within a segment.
function toRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*');
  return new RegExp(`^${escaped}$`);
}

describe('dependencies', () => {
  test('include no tracking, analytics or crash reporting SDK (decision D1)', () => {
    const declared = Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies });
    const patterns = FORBIDDEN_PACKAGES.map(toRegExp);

    const forbidden = declared.filter((name) => patterns.some((pattern) => pattern.test(name)));

    expect(forbidden).toEqual([]);
  });
});
