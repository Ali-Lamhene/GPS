import { render } from '@testing-library/react-native';

import type { Place } from '@/domain/place';
import { GLYPHS } from '@/ui/icon/glyphs';

import { PlaceAvatar } from '../place-avatar';

const gym: Place = { id: 'gym', icon: 'fitness_center', photo: 'file:///gym.jpg' };

describe('<PlaceAvatar />', () => {
  test('shows the photo with the place pictogram and the end symbol', async () => {
    const screen = await render(<PlaceAvatar place={gym} badge="flag" size={52} />);

    const tree = JSON.stringify(screen.toJSON());
    expect(tree).toContain('file:///gym.jpg');
    expect(tree).toContain(String.fromCodePoint(GLYPHS.fitness_center));
    expect(tree).toContain(String.fromCodePoint(GLYPHS.flag));
  });

  test('keeps the photo out of sight when asked, the pictogram alone', async () => {
    const screen = await render(<PlaceAvatar place={gym} size={52} showPhoto={false} />);

    const tree = JSON.stringify(screen.toJSON());
    expect(tree).not.toContain('file:///gym.jpg');
    expect(tree).toContain(String.fromCodePoint(GLYPHS.fitness_center));
  });
});
