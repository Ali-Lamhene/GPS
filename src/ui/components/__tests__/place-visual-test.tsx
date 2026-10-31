import { render } from '@testing-library/react-native';

import { GLYPHS } from '@/ui/icon/glyphs';

import { PlaceVisual } from '../place-visual';
import { PulseRing } from '../pulse-ring';

describe('<PlaceVisual />', () => {
  test('shows the pictogram alone when the place has no photo', async () => {
    const screen = await render(
      <PlaceVisual place={{ id: 'a', icon: 'home' }} iconSize={46} badgeSize={42} color="#000" />,
    );

    expect(screen.toJSON()).toMatchObject({ children: [String.fromCodePoint(GLYPHS.home)] });
  });

  test('puts the pictogram in a badge over the photo', async () => {
    const screen = await render(
      <PlaceVisual
        place={{ id: 'a', icon: 'home', photo: 'tramStop' }}
        iconSize={46}
        badgeSize={42}
        color="#000"
      />,
    );

    const tree = JSON.stringify(screen.toJSON());
    expect(tree).toContain('tram-stop.jpg');
    expect(tree).toContain(String.fromCodePoint(GLYPHS.home));
  });
});

describe('<PulseRing />', () => {
  test('never catches touches', async () => {
    const screen = await render(<PulseRing borderRadius={32} />);

    expect(screen.toJSON()).toMatchObject({ props: { pointerEvents: 'none' } });
  });
});
