import { DEMO_BUS_LEG } from '@/testing/fixtures/trips';

import { approachLeft, isAlert, spokenName } from '../guidance';

describe('guidance', () => {
  test('only getting off soon is an alert', () => {
    expect(isAlert({ kind: 'getOffSoon', leg: DEMO_BUS_LEG })).toBe(true);
    expect(isAlert({ kind: 'ride', leg: DEMO_BUS_LEG })).toBe(false);
    expect(isAlert({ kind: 'walk', turn: 'left' })).toBe(false);
  });

  test('offers the name to listen to: stop, direction, then destination stop', () => {
    expect(spokenName({ kind: 'reachStop', leg: DEMO_BUS_LEG })).toBe('Place de la Corderie');
    expect(spokenName({ kind: 'waitVehicle', leg: DEMO_BUS_LEG })).toBe('Vieux Port Ballard');
    expect(spokenName({ kind: 'ride', leg: DEMO_BUS_LEG })).toBe('Vieux Port Ballard');
    expect(spokenName({ kind: 'getOffSoon', leg: DEMO_BUS_LEG })).toBe('Vieux Port Ballard');
    expect(spokenName({ kind: 'walk', turn: 'straight' })).toBeUndefined();
  });
});

describe('approachLeft', () => {
  test('empties over the last 80 m before the corner, whatever the leg length', () => {
    expect(approachLeft(0.1, 0.5, 1000)).toBe(1);
    expect(approachLeft(0.46, 0.5, 1000)).toBeCloseTo(0.5);
    expect(approachLeft(0.3, 0.5, 200)).toBeCloseTo(0.5);
    expect(approachLeft(0.5, 0.5, 1000)).toBe(0);
    expect(approachLeft(0.6, 0.5, 1000)).toBe(0);
  });

  test('stays full without a corner ahead', () => {
    expect(approachLeft(0.3, undefined, 500)).toBe(1);
  });
});
