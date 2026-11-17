import { pinAtPoint } from '../pin-hit';

// A pin of 42 points wide stands 54.6 points tall above its point; its head is centred
// 21 points below its top.
const pin = (id: string, x: number, y: number, selected = false) => ({ id, x, y, selected });

describe('pinAtPoint (spec 037)', () => {
  test('a finger on the head or the tip of a pin finds it', () => {
    const pins = [pin('a', 100, 200)];

    expect(pinAtPoint([100, 167], pins)).toBe('a');
    expect(pinAtPoint([100, 198], pins)).toBe('a');
    expect(pinAtPoint([118, 160], pins)).toBe('a');
  });

  test('a finger beside, above or below the pin finds nothing', () => {
    const pins = [pin('a', 100, 200)];

    expect(pinAtPoint([140, 170], pins)).toBeUndefined();
    expect(pinAtPoint([100, 130], pins)).toBeUndefined();
    expect(pinAtPoint([100, 215], pins)).toBeUndefined();
    expect(pinAtPoint([100, 170], [])).toBeUndefined();
  });

  test('the chosen pin is larger, so its box is too', () => {
    expect(pinAtPoint([125, 160], [pin('a', 100, 200)])).toBeUndefined();
    expect(pinAtPoint([125, 160], [pin('a', 100, 200, true)])).toBe('a');
  });

  test('no enlarged area: just beside the drawing is no hit, like a short touch (D15)', () => {
    expect(pinAtPoint([123, 170], [pin('a', 100, 200)])).toBeUndefined();
    expect(pinAtPoint([100, 203], [pin('a', 100, 200)])).toBeUndefined();
  });

  test("a finger on the traveller's dot finds no pin, even over one", () => {
    const pins = [pin('home', 100, 200)];
    const dot = { x: 100, y: 190, radius: 34 };

    expect(pinAtPoint([100, 170], pins, dot)).toBeUndefined();
    expect(pinAtPoint([100, 150], pins, dot)).toBe('home');
  });

  test('overlapping pins: the one whose head is nearest the finger', () => {
    const pins = [pin('left', 100, 200), pin('right', 120, 200)];

    expect(pinAtPoint([104, 170], pins)).toBe('left');
    expect(pinAtPoint([116, 170], pins)).toBe('right');
  });
});
