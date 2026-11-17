import { render } from '@testing-library/react-native';

import { GLYPHS } from '@/ui/icon/glyphs';

import { PlacePin } from '../place-pin';

describe('PlacePin', () => {
  test('shows the photo kept on the phone (field feedback)', async () => {
    const screen = await render(
      <PlacePin icon="home" photo="file:///data/photos/abc.jpg" selected={false} />,
    );

    expect(screen.getByTestId('place-pin-photo').props.source).toEqual({
      uri: 'file:///data/photos/abc.jpg',
    });
  });

  test('never fetches a web address as a photo', async () => {
    const screen = await render(
      <PlacePin icon="home" photo="https://example.org/a.jpg" selected={false} />,
    );

    expect(screen.queryByTestId('place-pin-photo')).toBeNull();
  });
});

describe('PlacePin pictogram under the photo (spec 036)', () => {
  test('keeps the big pictogram under the photo, for a slow or missing picture', async () => {
    const screen = await render(
      <PlacePin icon="home" photo="file:///data/photos/abc.jpg" selected={false} />,
    );

    // Once as the big pictogram under the photo, once in the small badge.
    const glyph = String.fromCodePoint(GLYPHS.home);
    expect(JSON.stringify(screen.toJSON()).split(glyph).length - 1).toBe(2);
  });
});
