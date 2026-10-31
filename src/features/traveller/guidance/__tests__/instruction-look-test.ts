import { DEMO_GUIDANCE } from '../../demo/guidance';
import { DEMO_BUS_LEG, DEMO_METRO_LEG } from '../../demo/trips';
import { mainSymbol, nextSymbol, stepCue } from '../instruction-look';

describe('instruction look', () => {
  test('turns show their arrow, vehicles their pictogram, the metro its sign', () => {
    expect(mainSymbol({ kind: 'walk', turn: 'left' })).toBe('turn_left');
    expect(mainSymbol({ kind: 'ride', leg: DEMO_BUS_LEG })).toBe('directions_bus');
    expect(mainSymbol({ kind: 'ride', leg: DEMO_METRO_LEG })).toBe('metro');
    expect(mainSymbol({ kind: 'getOffSoon', leg: DEMO_METRO_LEG })).toBe('notifications_active');
  });

  test('after getting off, the next move is shown beside', () => {
    expect(nextSymbol({ kind: 'gotOff' })).toBe('directions_walk');
    expect(nextSymbol({ kind: 'leaveStation' })).toBe('north');
    expect(nextSymbol({ kind: 'walkToDestination' }, { id: 'b', icon: 'beach_access' })).toBe(
      'beach_access',
    );
    expect(nextSymbol({ kind: 'ride', leg: DEMO_BUS_LEG })).toBeUndefined();
  });

  test('turns, alerts, vehicles, exits and offline each have their cue', () => {
    const cues = DEMO_GUIDANCE.transit.map(stepCue);

    expect(cues).toEqual([
      undefined,
      'turn',
      'turn',
      undefined,
      'vehicle',
      undefined,
      'alert',
      'exit',
      undefined,
      'vehicle',
      undefined,
      'offline',
      'alert',
      'exit',
      undefined,
    ]);
  });
});
