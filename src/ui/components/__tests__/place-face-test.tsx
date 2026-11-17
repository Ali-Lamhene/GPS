import { render } from '@testing-library/react-native';

import { GLYPHS } from '@/ui/icon/glyphs';

import { PlaceFace } from '../place-face';
import { PulseRing } from '../pulse-ring';

describe('<PlaceFace />', () => {
  test('shows the emerald pictogram when the place has no photo', async () => {
    const screen = await render(<PlaceFace place={{ id: 'a', icon: 'home' }} iconSize={46} />);

    expect(JSON.stringify(screen.toJSON())).toContain(String.fromCodePoint(GLYPHS.home));
  });

  test('puts the pictogram in a white disc over the photo', async () => {
    const screen = await render(
      <PlaceFace
        place={{ id: 'a', icon: 'home', photo: 'file:///place.jpg' }}
        iconSize={46}
        badgeSize={42}
      />,
    );

    const tree = JSON.stringify(screen.toJSON());
    expect(tree).toContain('file:///place.jpg');
    expect(tree).toContain(String.fromCodePoint(GLYPHS.home));
  });

  test('shows the photo of a home too (hiddenOnMap rule lifted, 2026-11-17)', async () => {
    const screen = await render(
      <PlaceFace place={{ id: 'home', icon: 'home', photo: 'file:///home.jpg' }} iconSize={46} />,
    );

    expect(JSON.stringify(screen.toJSON())).toContain('file:///home.jpg');
  });

  test('never loads a web address as a photo', async () => {
    const screen = await render(
      <PlaceFace place={{ id: 'a', icon: 'home', photo: 'https://x.test/p.jpg' }} iconSize={46} />,
    );

    expect(JSON.stringify(screen.toJSON())).not.toContain('https://x.test');
  });
});

describe('<PulseRing />', () => {
  test('never catches touches', async () => {
    const screen = await render(<PulseRing borderRadius={32} />);

    expect(screen.toJSON()).toMatchObject({ props: { pointerEvents: 'none' } });
  });
});
