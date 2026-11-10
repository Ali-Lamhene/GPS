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
/** About 100 m north of the walk, `step` times 8 m further east. */
const away = (step: number): LngLat => [5.371 + step * 0.0001, 43.2909];

describe('useOffRoute (specs 031, 032)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });
  afterEach(() => jest.useRealTimers());

  /** Points away from the walk, from `away(0)` to `away(last)`; the alert comes at `away(1)`. */
  async function walkAway(reroute: jest.Mock, last: number, onRerouted = jest.fn()) {
    const hook = await renderHook(
      ({ point }: { point: LngLat | undefined }) =>
        useOffRoute({ point, legs: [WALK], legIndex: 0, reroute, onRerouted }),
      { initialProps: { point: away(0) } },
    );
    for (let step = 1; step <= last; step += 1) {
      await act(() => jest.advanceTimersByTime(1000));
      await hook.rerender({ point: away(step) });
    }
    return hook;
  }

  test('two points off: orange and the alert at once, no new trip yet', async () => {
    const reroute = jest.fn(async () => true);
    const { result } = await walkAway(reroute, 1);

    expect(playCue).toHaveBeenCalledWith('alert');
    expect(result.current).toEqual({ lost: true, computing: false });
    expect(reroute).not.toHaveBeenCalled();
  });

  test('still within 30 m of the alert: no new trip', async () => {
    const reroute = jest.fn(async () => true);
    // away(4) lies about 24 m from away(1).
    const { result } = await walkAway(reroute, 4);

    expect(reroute).not.toHaveBeenCalled();
    expect(result.current.lost).toBe(true);
  });

  test('30 m on from the alert: a new trip from here', async () => {
    const reroute = jest.fn(async () => true);
    const onRerouted = jest.fn();
    // away(5) lies about 32 m from away(1).
    const { result } = await walkAway(reroute, 5, onRerouted);

    expect(reroute).toHaveBeenCalledTimes(1);
    expect(reroute).toHaveBeenCalledWith(away(5), expect.anything(), expect.any(Function));
    // The new trip replaces the old one: no more orange.
    expect(onRerouted).toHaveBeenCalled();
    expect(result.current.lost).toBe(false);
  });

  test('no new trip (no network): stays orange, tries again on the next point', async () => {
    const reroute = jest.fn(async () => false);
    const hook = await walkAway(reroute, 5);

    expect(reroute).toHaveBeenCalledTimes(1);
    expect(hook.result.current).toEqual({ lost: true, computing: false });
    await hook.rerender({ point: away(6) });
    expect(reroute).toHaveBeenCalledTimes(2);
  });

  test('a slow answer is kept while new points come (review of spec 032)', async () => {
    let answer: (ok: boolean) => void = () => undefined;
    const reroute = jest.fn(
      (_from: LngLat, _signal: AbortSignal, onStart?: () => void) =>
        new Promise<boolean>((resolve) => {
          onStart?.();
          answer = resolve;
        }),
    );
    const onRerouted = jest.fn();
    const hook = await walkAway(reroute, 5, onRerouted);
    expect(hook.result.current.computing).toBe(true);

    // The traveller walks on while the answer is slow: the request is neither cut nor sent again.
    await hook.rerender({ point: away(6) });
    await hook.rerender({ point: away(7) });
    expect(reroute).toHaveBeenCalledTimes(1);

    await act(async () => answer(true));
    expect(onRerouted).toHaveBeenCalled();
    expect(hook.result.current.lost).toBe(false);
  });

  test('a try refused at once (30 s pace) never shows the turning arrows', async () => {
    const reroute = jest.fn(async () => false);
    const hook = await walkAway(reroute, 5);
    expect(hook.result.current.computing).toBe(false);
  });

  test('back on the way only close to it, on two points (no flicker)', async () => {
    const reroute = jest.fn(async () => false);
    // About 20 m off the walk: the alert, then a step back towards it.
    const hook = await renderHook(
      ({ point }: { point: LngLat | undefined }) =>
        useOffRoute({ point, legs: [WALK], legIndex: 0, reroute, onRerouted: jest.fn() }),
      { initialProps: { point: [5.375, 43.29018] as LngLat } },
    );
    await hook.rerender({ point: [5.3751, 43.29018] });
    expect(hook.result.current.lost).toBe(true);
    // About 13 m away: under the 15 m alarm, above the 10 m return.
    await hook.rerender({ point: [5.3752, 43.29012] });
    expect(hook.result.current.lost).toBe(true);
    await hook.rerender({ point: [5.3753, 43.29005] });
    expect(hook.result.current.lost).toBe(true);
    await hook.rerender({ point: [5.3754, 43.29005] });
    expect(hook.result.current.lost).toBe(false);
    expect(reroute).not.toHaveBeenCalled();
  });

  test('the position lost (metro, tunnel): the orange goes', async () => {
    const reroute = jest.fn(async () => false);
    const hook = await walkAway(reroute, 1);
    await hook.rerender({ point: undefined });
    expect(hook.result.current.lost).toBe(false);
  });

  test('still lost after 30 s: the alert again', async () => {
    const reroute = jest.fn(async () => false);
    await walkAway(reroute, 1);
    jest.mocked(playCue).mockClear();
    await act(() => jest.advanceTimersByTime(30_000));
    expect(playCue).toHaveBeenCalledWith('alert');
  });

  test('a single GPS jump never alerts', async () => {
    const reroute = jest.fn(async () => true);
    const { rerender, result } = await renderHook(
      ({ point }: { point: LngLat | undefined }) =>
        useOffRoute({ point, legs: [WALK], legIndex: 0, reroute, onRerouted: jest.fn() }),
      { initialProps: { point: away(0) } },
    );
    await act(() => jest.advanceTimersByTime(1000));
    await rerender({ point: [5.375, 43.2901] });

    expect(result.current.lost).toBe(false);
    expect(playCue).not.toHaveBeenCalled();
  });
});
