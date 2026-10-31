import { render } from '@testing-library/react-native';

import { slicePath } from '../time-dial';
import { TimeDials } from '../time-dials';

describe('slicePath', () => {
  test('starts at 12 o’clock and turns clockwise', () => {
    expect(slicePath(0.25, 50)).toBe('M 50 50 L 50 0 A 50 50 0 0 1 100.00 50.00 Z');
    expect(slicePath(0.5, 50)).toBe('M 50 50 L 50 0 A 50 50 0 0 1 50.00 100.00 Z');
  });

  test('uses the large arc past half a dial', () => {
    expect(slicePath(0.75, 50)).toBe('M 50 50 L 50 0 A 50 50 0 1 1 0.00 50.00 Z');
  });
});

describe('<TimeDials />', () => {
  test('draws one dial per started hour', async () => {
    const short = await render(<TimeDials minutes={35} size={40} crossColor="#fff" />);
    const long = await render(<TimeDials minutes={75} size={40} crossColor="#fff" />);

    expect(short.toJSON()).toMatchObject({ children: { length: 1 } });
    expect(long.toJSON()).toMatchObject({ children: { length: 2 } });
  });
});
