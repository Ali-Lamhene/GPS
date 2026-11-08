import { act, renderHook } from '@testing-library/react-native';

import type { LngLat } from '@/domain/geo';
import type { Leg } from '@/domain/trip';
import { playCue } from '@/services/feedback';

import { useOffRoute } from '../use-off-route';

jest.mock('@/services/feedback', () => ({ playCue: jest.fn() }));

const WALK: Leg = {
  kind: 'walk',
  minutes: 5,
  path: [
    [5.37, 43.29],
    [5.38, 43.29],
  ],
};
/** About 100 m north of the walk. */
const away = (step: number): LngLat => [5.371 + step * 0.0001, 43.2909];

describe('useOffRoute (spec 031)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });
  afterEach(() => jest.useRealTimers());

  async function walkAway(reroute: jest.Mock, onRerouted = jest.fn()) {
    const hook = await renderHook(
      ({ point }: { point: LngLat | undefined }) =>
        useOffRoute({ point, legs: [WALK], legIndex: 0, reroute, onRerouted }),
      { initialProps: { point: away(0) } },
    );
    for (const step of [1, 2, 3]) {
      await act(() => jest.advanceTimersByTime(4000));
      await hook.rerender({ point: away(step) });
    }
    return hook;
  }

  test('off the way for 10 s: orange, the alert, then a new trip from here', async () => {
    const reroute = jest.fn(async () => true);
    const onRerouted = jest.fn();
    const { result } = await walkAway(reroute, onRerouted);

    expect(playCue).toHaveBeenCalledWith('alert');
    expect(reroute).toHaveBeenCalledWith(away(3), expect.anything());
    // The new trip replaces the old one: no more orange.
    expect(onRerouted).toHaveBeenCalled();
    expect(result.current.lost).toBe(false);
  });

  test('no new trip (no network): stays orange', async () => {
    const reroute = jest.fn(async () => false);
    const { result } = await walkAway(reroute);

    expect(reroute).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual({ lost: true, computing: false });
  });

  test('back on the way only close to it, on two points (no flicker)', async () => {
    const reroute = jest.fn(async () => false);
    const hook = await walkAway(reroute);
    // 30 m away: under the 40 m alarm, above the 25 m return.
    await hook.rerender({ point: [5.375, 43.29027] });
    expect(hook.result.current.lost).toBe(true);
    await hook.rerender({ point: [5.3751, 43.2901] });
    expect(hook.result.current.lost).toBe(true);
    await hook.rerender({ point: [5.3752, 43.2901] });
    expect(hook.result.current.lost).toBe(false);
  });

  test('the position lost (metro, tunnel): the orange goes', async () => {
    const reroute = jest.fn(async () => false);
    const hook = await walkAway(reroute);
    await hook.rerender({ point: undefined });
    expect(hook.result.current.lost).toBe(false);
  });

  test('still lost after 30 s: the alert again', async () => {
    const reroute = jest.fn(async () => false);
    await walkAway(reroute);
    jest.mocked(playCue).mockClear();
    await act(() => jest.advanceTimersByTime(30_000));
    expect(playCue).toHaveBeenCalledWith('alert');
  });

  test('a short detour never alerts', async () => {
    const reroute = jest.fn(async () => true);
    const { rerender, result } = await renderHook(
      ({ point }: { point: LngLat | undefined }) =>
        useOffRoute({ point, legs: [WALK], legIndex: 0, reroute, onRerouted: jest.fn() }),
      { initialProps: { point: away(0) } },
    );
    await act(() => jest.advanceTimersByTime(4000));
    await rerender({ point: [5.375, 43.2901] });

    expect(result.current.lost).toBe(false);
    expect(playCue).not.toHaveBeenCalled();
  });
});
