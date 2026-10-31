import type { GuidanceStep, Turn } from '@/domain/guidance';
import type { TravelMode } from '@/domain/trip';

import { DEMO_BUS_LEG as bus, DEMO_METRO_LEG as metro } from './trips';

// Simulated guidance of the static mockup implementation (D11): the traveller moves
// to the next step by touching the instruction card. Real tracking comes with spec 003.

const findPlace = { kind: 'findPlace' } as const;

function walkSteps(
  positions: readonly [number, number][],
  remaining: readonly number[],
  help: GuidanceStep['help'],
  stopMarker: boolean,
): GuidanceStep[] {
  const turns: Turn[] = ['straight', 'left', 'right'];
  return turns.map((turn, i) => ({
    instruction: { kind: 'walk', turn },
    visual: {
      kind: 'map',
      route: turn,
      marker: turn === 'straight' ? (stopMarker ? 'stop' : 'destination') : undefined,
    },
    legIndex: positions[i]?.[0] ?? 0,
    legFraction: positions[i]?.[1] ?? 0,
    remainingMinutes: remaining[i] ?? 0,
    help,
  }));
}

function finalWalk(legIndex: number, legFraction: number, remainingMinutes: number): GuidanceStep {
  return {
    instruction: { kind: 'walkToDestination' },
    visual: { kind: 'map', route: 'arrive', marker: 'destination' },
    legIndex,
    legFraction,
    remainingMinutes,
    help: findPlace,
  };
}

const findStop = { kind: 'findStop', leg: bus } as const;

export const DEMO_GUIDANCE: Record<TravelMode, readonly GuidanceStep[]> = {
  walk: [
    ...walkSteps(
      [
        [0, 0.1],
        [0, 0.3],
        [0, 0.6],
      ],
      [52, 44, 30],
      findPlace,
      false,
    ),
    finalWalk(0, 0.9, 6),
  ],
  car: [
    ...walkSteps(
      [
        [0, 0.2],
        [0, 0.5],
        [0, 0.8],
      ],
      [18, 14, 9],
      findPlace,
      false,
    ),
    finalWalk(1, 0.5, 2),
  ],
  transit: [
    ...walkSteps(
      [
        [0, 0.25],
        [0, 0.5],
        [0, 0.8],
      ],
      [35, 33, 31],
      findStop,
      true,
    ),
    {
      instruction: { kind: 'reachStop', leg: bus },
      visual: { kind: 'photo', photo: 'busStop', focus: { x: 20, y: 40 } },
      legIndex: 0,
      legFraction: 1,
      remainingMinutes: 29,
      help: findStop,
    },
    {
      instruction: { kind: 'waitVehicle', leg: bus },
      visual: { kind: 'photo', photo: 'busStop', focus: { x: 75, y: 50 } },
      legIndex: 1,
      legFraction: 0,
      remainingMinutes: 28,
      help: { kind: 'checkStop', leg: bus },
    },
    {
      instruction: { kind: 'ride', leg: bus },
      visual: { kind: 'photo', photo: 'busInterior', focus: { x: 45, y: 40 } },
      legIndex: 1,
      legFraction: 0.4,
      remainingMinutes: 22,
      help: { kind: 'getOffBus', leg: bus },
    },
    {
      instruction: { kind: 'getOffSoon', leg: bus },
      visual: { kind: 'photo', photo: 'busInterior', focus: { x: 45, y: 40 } },
      legIndex: 1,
      legFraction: 0.85,
      remainingMinutes: 18,
      help: { kind: 'getOffBus', leg: bus },
    },
    {
      instruction: { kind: 'gotOff' },
      visual: { kind: 'photo', photo: 'busExit', focus: { x: 45, y: 45 } },
      legIndex: 1,
      legFraction: 1,
      remainingMinutes: 17,
      help: { kind: 'getOffBus', leg: bus },
    },
    {
      instruction: { kind: 'reachStop', leg: metro },
      visual: { kind: 'photo', photo: 'metroEntrance', focus: { x: 45, y: 40 } },
      legIndex: 2,
      legFraction: 0.9,
      remainingMinutes: 13,
      help: { kind: 'findMetro', leg: metro },
    },
    {
      instruction: { kind: 'waitVehicle', leg: metro },
      visual: { kind: 'photo', photo: 'metroPlatform', focus: { x: 35, y: 45 } },
      legIndex: 3,
      legFraction: 0,
      remainingMinutes: 12,
      help: { kind: 'findMetro', leg: metro },
    },
    {
      instruction: { kind: 'ride', leg: metro },
      visual: { kind: 'photo', photo: 'metroInteriorBlue', focus: { x: 40, y: 45 } },
      legIndex: 3,
      legFraction: 0.4,
      remainingMinutes: 9,
      help: { kind: 'getOffMetro', leg: metro },
    },
    {
      instruction: { kind: 'ride', leg: metro },
      visual: { kind: 'photo', photo: 'metroPlatform', focus: { x: 50, y: 55 } },
      legIndex: 3,
      legFraction: 0.6,
      remainingMinutes: 7,
      help: { kind: 'getOffMetro', leg: metro },
      offline: true,
    },
    {
      instruction: { kind: 'getOffSoon', leg: metro },
      visual: { kind: 'photo', photo: 'metroInteriorYellow', focus: { x: 35, y: 45 } },
      legIndex: 3,
      legFraction: 0.85,
      remainingMinutes: 5,
      help: { kind: 'getOffMetro', leg: metro },
    },
    {
      instruction: { kind: 'leaveStation' },
      visual: { kind: 'photo', photo: 'metroEntrance', focus: { x: 45, y: 50 } },
      legIndex: 3,
      legFraction: 1,
      remainingMinutes: 4,
      help: findPlace,
    },
    finalWalk(4, 0.5, 3),
  ],
};
