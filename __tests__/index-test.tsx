import { render } from '@testing-library/react-native';

import Index from '@/app/index';

describe('<Index />', () => {
  test('renders the home screen', async () => {
    const screen = await render(<Index />);

    expect(screen.toJSON()).toBeTruthy();
  });
});
