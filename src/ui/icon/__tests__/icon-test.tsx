import { render } from '@testing-library/react-native';

import { fontFamilies } from '@/ui/theme';

import { Icon } from '../icon';
import { GLYPHS } from '../glyphs';

describe('<Icon />', () => {
  test('draws the glyph of the named symbol', async () => {
    const screen = await render(<Icon name="home" />);

    expect(screen.toJSON()).toMatchObject({ children: [String.fromCodePoint(GLYPHS.home)] });
  });

  test('uses the filled font by default and the outlined one on request', async () => {
    const filled = await render(<Icon name="help" />);
    const outlined = await render(<Icon name="help" variant="outlined" />);

    expect(filled.toJSON()).toHaveStyle({ fontFamily: fontFamilies.iconFilled });
    expect(outlined.toJSON()).toHaveStyle({ fontFamily: fontFamilies.icon });
  });

  test('is hidden from screen readers', async () => {
    const screen = await render(<Icon name="home" size={40} />);

    expect(screen.toJSON()).toMatchObject({ props: { accessible: false } });
    expect(screen.toJSON()).toHaveStyle({ fontSize: 40, width: 40, height: 40 });
  });
});

describe('GLYPHS', () => {
  test('are Material Symbols codepoints in the private use areas', () => {
    for (const codepoint of Object.values(GLYPHS)) {
      expect(codepoint >= 0xe000 && codepoint <= 0xf8ff).toBe(true);
    }
  });
});
