import { findTurns, type LngLat } from '@/domain/geo';
import type { GuidanceStep } from '@/domain/guidance';
import type { TravelMode } from '@/domain/trip';

import { DEMO_BUS_LEG as bus, DEMO_METRO_LEG as metro } from './trips';
import { CAR, TO_BUS_STOP, WALK_ONLY } from './marseille-paths';

// Simulated guidance of the static mockup implementation (D11): the traveller moves
// to the next step by touching the instruction card. Real tracking comes with spec 003.

const findPlace = { kind: 'findPlace' } as const;

/**
 * Walking steps taken from the real path: go straight, then the first turn on each side,
 * just before the corner (spec 002: the turn shown is the one in the street).
 */
function walkSteps(
  legIndex: number,
  path: readonly LngLat[],
  help: GuidanceStep['help'],
): GuidanceStep[] {
  const turns = findTurns(path).filter((turn) => turn.fraction > 0.12);
  const firstLeft = turns.find((turn) => turn.direction === 'left');
  const firstRight = turns.find((turn) => turn.direction === 'right');
  const corners = [firstLeft, firstRight]
    .filter((turn) => turn !== undefined)
    .sort((x, y) => x.fraction - y.fraction);
  const straight: GuidanceStep = {
    instruction: { kind: 'walk', turn: 'straight' },
    legIndex,
    legFraction: 0.04,
    help,
  };
  return [
    straight,
    ...corners.map((turn): GuidanceStep => ({
      instruction: { kind: 'walk', turn: turn.direction },
      legIndex,
      legFraction: Math.max(0.05, turn.fraction - 0.03),
      help,
    })),
  ];
}

function finalWalk(legIndex: number, legFraction: number): GuidanceStep {
  return {
    instruction: { kind: 'walkToDestination' },
    legIndex,
    legFraction,
    help: findPlace,
  };
}

const findStop = { kind: 'findStop', leg: bus } as const;

export const DEMO_GUIDANCE: Record<TravelMode, readonly GuidanceStep[]> = {
  walk: [...walkSteps(0, WALK_ONLY, findPlace), finalWalk(0, 0.9)],
  car: [...walkSteps(0, CAR, findPlace), finalWalk(1, 0.5)],
  transit: [
    ...walkSteps(0, TO_BUS_STOP, findStop),
    {
      instruction: { kind: 'reachStop', leg: bus },
      legIndex: 0,
      legFraction: 1,
      help: findStop,
    },
    {
      instruction: { kind: 'waitVehicle', leg: bus },
      legIndex: 1,
      legFraction: 0,
      help: { kind: 'checkStop', leg: bus },
    },
    {
      instruction: { kind: 'ride', leg: bus },
      legIndex: 1,
      legFraction: 0.4,
      help: { kind: 'getOffBus', leg: bus },
    },
    {
      instruction: { kind: 'getOffSoon', leg: bus },
      legIndex: 1,
      legFraction: 0.85,
      help: { kind: 'getOffBus', leg: bus },
    },
    {
      instruction: { kind: 'gotOff' },
      legIndex: 1,
      legFraction: 1,
      help: { kind: 'getOffBus', leg: bus },
    },
    {
      instruction: { kind: 'reachStop', leg: metro },
      legIndex: 2,
      legFraction: 0.9,
      help: { kind: 'findMetro', leg: metro },
    },
    {
      instruction: { kind: 'waitVehicle', leg: metro },
      legIndex: 3,
      legFraction: 0,
      help: { kind: 'findMetro', leg: metro },
    },
    {
      instruction: { kind: 'ride', leg: metro },
      legIndex: 3,
      legFraction: 0.4,
      help: { kind: 'getOffMetro', leg: metro },
    },
    {
      instruction: { kind: 'ride', leg: metro },
      legIndex: 3,
      legFraction: 0.6,
      help: { kind: 'getOffMetro', leg: metro },
      offline: true,
    },
    {
      instruction: { kind: 'getOffSoon', leg: metro },
      legIndex: 3,
      legFraction: 0.85,
      help: { kind: 'getOffMetro', leg: metro },
    },
    {
      instruction: { kind: 'leaveStation' },
      legIndex: 3,
      legFraction: 1,
      help: findPlace,
    },
    finalWalk(4, 0.5),
  ],
};
