import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { CompanionEntryTile, ringPath } from '../companion-entry-tile';

const label = { name: 'Accompagnant : appui long 3 secondes' };

describe('<CompanionEntryTile />', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('opens the companion area after a 3 second press', async () => {
    const onEnter = jest.fn();
    await render(<CompanionEntryTile onEnter={onEnter} />);

    await fireEvent(screen.getByRole('button', label), 'pressIn');
    await act(() => jest.advanceTimersByTime(2900));
    expect(onEnter).not.toHaveBeenCalled();

    await act(() => jest.advanceTimersByTime(200));
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  test('a short press does nothing', async () => {
    const onEnter = jest.fn();
    await render(<CompanionEntryTile onEnter={onEnter} />);

    await fireEvent(screen.getByRole('button', label), 'pressIn');
    await act(() => jest.advanceTimersByTime(1000));
    await fireEvent(screen.getByRole('button', label), 'pressOut');
    await act(() => jest.advanceTimersByTime(3000));

    expect(onEnter).not.toHaveBeenCalled();
  });
});

describe('ringPath', () => {
  test('measures the rounded outline from the top centre', () => {
    const r = 8 - 1.5;
    const side = 100 - 3 - 2 * r;

    expect(ringPath(100).length).toBeCloseTo(4 * side + 2 * Math.PI * r);
    expect(ringPath(100).d.startsWith('M 50 1.5')).toBe(true);
  });
});
