import { render } from '@testing-library/react-native';

import { GLYPHS } from '@/ui/icon/glyphs';

import { PlaceFace } from '../place-face';
import { PulseRing } from '../pulse-ring';

describe('<PlaceFace />', () => {
  test('shows the emerald pictogram when the place has no photo', async () => {
    const screen = await render(
      <PlaceFace place={{ id: 'a', icon: 'home' }} iconSize={46} showPhoto />,
    );

    expect(JSON.stringify(screen.toJSON())).toContain(String.fromCodePoint(GLYPHS.home));
  });

  test('puts the pictogram in a white disc over the photo', async () => {
    const screen = await render(
      <PlaceFace
        place={{ id: 'a', icon: 'home', photo: 'file:///place.jpg' }}
        iconSize={46}
        badgeSize={42}
        showPhoto
      />,
    );

    const tree = JSON.stringify(screen.toJSON());
    expect(tree).toContain('file:///place.jpg');
    expect(tree).toContain(String.fromCodePoint(GLYPHS.home));
  });

  test('keeps the photo out of sight when asked', async () => {
    const screen = await render(
      <PlaceFace
        place={{ id: 'a', icon: 'home', photo: 'file:///place.jpg' }}
        iconSize={46}
        showPhoto={false}
      />,
    );

    expect(JSON.stringify(screen.toJSON())).not.toContain('file:///place.jpg');
  });
});

describe('<PulseRing />', () => {
  test('never catches touches', async () => {
    const screen = await render(<PulseRing borderRadius={32} />);

    expect(screen.toJSON()).toMatchObject({ props: { pointerEvents: 'none' } });
  });
});
