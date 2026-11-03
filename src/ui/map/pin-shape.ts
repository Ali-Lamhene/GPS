// Teardrop of the place pins (spec 009), shared by the phone and browser maps. Drawn in
// a 40 × 52 box: a round head of radius 18 centred at (20, 20), the tip at the bottom.

export const PIN_BOX = { width: 40, height: 52 } as const;
export const PIN_HEAD = { cx: 20, cy: 20, r: 18 } as const;
export const PIN_PATH = 'M20 51 C15.5 43 2 33.5 2 20 A18 18 0 0 1 38 20 C38 33.5 24.5 43 20 51 Z';

/** Pin width on screen: the chosen place stands out by its size (spec 009). */
export function pinWidth(selected: boolean): number {
  return selected ? 60 : 42;
}

/** Where the round face sits inside a pin of that width, in screen points. */
export function pinFace(width: number, selected: boolean) {
  const scale = width / PIN_BOX.width;
  // The chosen pin is emerald with a white face inside; the others are a white face.
  const radius = (selected ? 13.5 : 15.5) * scale;
  return {
    size: radius * 2,
    left: PIN_HEAD.cx * scale - radius,
    top: PIN_HEAD.cy * scale - radius,
    height: PIN_BOX.height * scale,
  };
}
