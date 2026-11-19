import { introAtStart, introForCamera, introOnRetry } from '../permission-intro';

describe('the screen before a permission window (spec 038)', () => {
  test('at the start, only a position that can still be asked for opens it', () => {
    expect(introAtStart('denied')).toBe('ask');
    expect(introAtStart('granted')).toBeUndefined();
    expect(introAtStart('coarse')).toBeUndefined();
    expect(introAtStart('blocked')).toBeUndefined();
  });

  test('a touch on « here » crossed out opens it, for the right way out', () => {
    expect(introOnRetry('denied')).toBe('ask');
    expect(introOnRetry('coarse')).toBe('ask');
    expect(introOnRetry('blocked')).toBe('settings');
    expect(introOnRetry('granted')).toBeUndefined();
  });

  test('the camera: nothing once given, the window while Android asks, else the settings', () => {
    expect(introForCamera(true, true)).toBeUndefined();
    expect(introForCamera(true, false)).toBeUndefined();
    expect(introForCamera(false, true)).toBe('ask');
    expect(introForCamera(false, false)).toBe('settings');
  });
});
