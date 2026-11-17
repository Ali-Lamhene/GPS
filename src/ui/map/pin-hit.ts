import { PIN_HEAD, PIN_BOX, pinFace, pinWidth } from './pin-shape';

/** A pin placed on the screen: its point (the tip), in screen points. */
export type ProjectedPin = { id: string; x: number; y: number; selected: boolean };

/** How far outside its drawing a finger still hits a pin, in screen points. */
export const PIN_SLOP = 8;

/**
 * The pin under a finger at `point` (spec 037): pins stand above their point (anchor at the
 * bottom), so the hit box is the pin's drawing, a little enlarged. Among overlapping pins, the
 * one whose round head is nearest the finger.
 */
export function pinAtPoint(
  point: readonly [number, number],
  pins: readonly ProjectedPin[],
): string | undefined {
  const [x, y] = point;
  let best: { id: string; distance: number } | undefined;
  for (const pin of pins) {
    const width = pinWidth(pin.selected);
    const { height } = pinFace(width, pin.selected);
    const inside =
      x >= pin.x - width / 2 - PIN_SLOP &&
      x <= pin.x + width / 2 + PIN_SLOP &&
      y >= pin.y - height - PIN_SLOP &&
      y <= pin.y + PIN_SLOP;
    if (!inside) continue;
    const headY = pin.y - height + (PIN_HEAD.cy * width) / PIN_BOX.width;
    const distance = Math.hypot(x - pin.x, y - headY);
    if (!best || distance < best.distance) best = { id: pin.id, distance };
  }
  return best?.id;
}
