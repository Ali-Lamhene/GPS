import { render } from '@testing-library/react-native';

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
