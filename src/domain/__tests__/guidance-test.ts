import { DEMO_BUS_LEG } from '@/features/traveller/demo/trips';

import { isAlert, spokenName } from '../guidance';

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
