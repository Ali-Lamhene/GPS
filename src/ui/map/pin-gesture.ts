/** How long a finger stays on a pin to change its place (spec 037): the system's long press. */
export const LONG_PRESS_MS = 500;

/** A finger that moves farther than this is moving the map, not touching a pin. */
export const TOUCH_SLOP = 8;

type Timers = {
  set: (run: () => void, ms: number) => ReturnType<typeof setTimeout>;
  clear: (timer: ReturnType<typeof setTimeout>) => void;
};

const SYSTEM_TIMERS: Timers = {
  set: (run, ms) => setTimeout(run, ms),
  clear: (timer) => clearTimeout(timer),
};

/**
 * Tells a touch from a long press on a pin of the browser map (spec 037), from the pointer
 * events of its element. A long press fires once the finger has stayed still long enough; the
 * click that follows it is then no touch, so the place is never chosen as well.
 */
export function createPinGesture(onLongPress: (() => void) | undefined, timers = SYSTEM_TIMERS) {
  let start: { x: number; y: number } | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let longPressed = false;

  const stop = () => {
    if (timer !== undefined) timers.clear(timer);
    timer = undefined;
  };

  return {
    down(x: number, y: number) {
      stop();
      start = { x, y };
      longPressed = false;
      if (!onLongPress) return;
      const fire = onLongPress;
      timer = timers.set(() => {
        timer = undefined;
        longPressed = true;
        fire();
      }, LONG_PRESS_MS);
    },
    move(x: number, y: number) {
      if (start && Math.hypot(x - start.x, y - start.y) > TOUCH_SLOP) stop();
    },
    /** The finger left the pin or the screen. */
    up: stop,
    /** Whether the click at (x, y) is a touch on the pin: short, and not a drag of the map. */
    isTouch(x: number, y: number) {
      return (
        !longPressed && start !== undefined && Math.hypot(x - start.x, y - start.y) <= TOUCH_SLOP
      );
    },
  };
}
