import { PIN_HEAD, PIN_BOX, pinFace, pinWidth } from './pin-shape';

/** A pin placed on the screen: its point (the tip), in screen points. */
export type ProjectedPin = { id: string; x: number; y: number; selected: boolean };

/** The traveller's dot on the screen, drawn above the pins: a long press on it is no pin's. */
export type ProjectedDot = { x: number; y: number; radius: number };

/**
 * The pin under a finger at `point` (spec 037): pins stand above their point (anchor at the
 * bottom), so the hit box is the pin's drawing, not enlarged, like a short touch on a marker
 * (D15: no enlarged touch area). Among overlapping pins, the one whose round head is nearest
 * the finger. A finger on the traveller's dot finds no pin: the dot is drawn above them, and
 * « here » cannot be changed.
 */
export function pinAtPoint(
  point: readonly [number, number],
  pins: readonly ProjectedPin[],
  dot?: ProjectedDot,
): string | undefined {
  const [x, y] = point;
  if (dot && Math.hypot(x - dot.x, y - dot.y) <= dot.radius) return undefined;
  let best: { id: string; distance: number } | undefined;
  for (const pin of pins) {
    const width = pinWidth(pin.selected);
    const { height } = pinFace(width, pin.selected);
    const inside =
      x >= pin.x - width / 2 && x <= pin.x + width / 2 && y >= pin.y - height && y <= pin.y;
    if (!inside) continue;
    const headY = pin.y - height + (PIN_HEAD.cy * width) / PIN_BOX.width;
    const distance = Math.hypot(x - pin.x, y - headY);
    if (!best || distance < best.distance) best = { id: pin.id, distance };
  }
  return best?.id;
}
