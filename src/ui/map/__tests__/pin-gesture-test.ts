import { createPinGesture, LONG_PRESS_MS } from '../pin-gesture';

describe('createPinGesture: touch or long press on a browser pin (spec 037)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('a short touch is a touch, never a long press', () => {
    const onLongPress = jest.fn();
    const gesture = createPinGesture(onLongPress);

    gesture.down(10, 10);
    jest.advanceTimersByTime(LONG_PRESS_MS - 100);
    gesture.up();
    jest.advanceTimersByTime(1000);

    expect(gesture.isTouch(11, 11)).toBe(true);
    expect(onLongPress).not.toHaveBeenCalled();
  });

  test('a finger held still is a long press, and the click after it is no touch', () => {
    const onLongPress = jest.fn();
    const gesture = createPinGesture(onLongPress);

    gesture.down(10, 10);
    gesture.move(12, 13);
    jest.advanceTimersByTime(LONG_PRESS_MS);
    gesture.up();

    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(gesture.isTouch(12, 13)).toBe(false);
  });

  test('a finger that moves the map is neither', () => {
    const onLongPress = jest.fn();
    const gesture = createPinGesture(onLongPress);

    gesture.down(10, 10);
    gesture.move(40, 10);
    jest.advanceTimersByTime(LONG_PRESS_MS * 2);

    expect(onLongPress).not.toHaveBeenCalled();
    expect(gesture.isTouch(40, 10)).toBe(false);
  });

  test('without a long press handler, a held finger stays a touch', () => {
    const gesture = createPinGesture(undefined);

    gesture.down(10, 10);
    jest.advanceTimersByTime(LONG_PRESS_MS * 2);

    expect(gesture.isTouch(10, 10)).toBe(true);
  });

  test('no click is a touch before a finger came down', () => {
    expect(createPinGesture(jest.fn()).isTouch(0, 0)).toBe(false);
  });
});
