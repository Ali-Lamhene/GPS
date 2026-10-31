import { dialFills } from '../duration';

describe('dialFills', () => {
  test('fills one dial in proportion to the real minutes, without rounding to a quarter', () => {
    expect(dialFills(35)).toEqual([35 / 60]);
  });

  test('adds one full dial per hour', () => {
    expect(dialFills(60)).toEqual([1]);
    expect(dialFills(75)).toEqual([1, 15 / 60]);
    expect(dialFills(120)).toEqual([1, 1]);
  });

  test('always shows at least one dial', () => {
    expect(dialFills(0)).toEqual([0]);
    expect(dialFills(-5)).toEqual([0]);
  });

  test('rounds to the nearest minute', () => {
    expect(dialFills(34.6)).toEqual([35 / 60]);
  });
});
