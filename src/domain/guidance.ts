import type { HelpRequest } from './help-message';
import type { TransitLeg } from './trip';

export type Turn = 'straight' | 'left' | 'right';

/** The one thing the traveller has to do now. */
export type Instruction =
  | { kind: 'walk'; turn: Turn }
  | { kind: 'walkToDestination' }
  | { kind: 'reachStop'; leg: TransitLeg }
  | { kind: 'waitVehicle'; leg: TransitLeg }
  | { kind: 'ride'; leg: TransitLeg }
  | { kind: 'getOffSoon'; leg: TransitLeg }
  | { kind: 'gotOff' }
  | { kind: 'leaveStation' };

export type GuidanceStep = {
  instruction: Instruction;
  /** Position along the trip: leg index and fraction of that leg. */
  legIndex: number;
  legFraction: number;
  help: HelpRequest;
  /** No network in the metro: the app falls back to the saved trip (E21). */
  offline?: boolean;
};

/** Getting off is announced in orange with a pulsing tile. */
export function isAlert(instruction: Instruction): boolean {
  return instruction.kind === 'getOffSoon';
}

/** The stop or station name the traveller can listen to, if any (D9). */
export function spokenName(instruction: Instruction): string | undefined {
  switch (instruction.kind) {
    case 'reachStop':
      return instruction.leg.from;
    case 'waitVehicle':
      return instruction.leg.direction;
    case 'ride':
    case 'getOffSoon':
      return instruction.leg.to;
    default:
      return undefined;
  }
}

/** Distance over which the approach ring of a turn empties (spec 008): the same on every leg. */
export const APPROACH_METERS = 80;

/**
 * How much of the approach to a corner is left, from 1 (far, or no corner ahead) to 0
 * (at the corner), given where the traveller and the corner are along a leg of the given
 * length. Measured in metres, so « almost empty » always means the same few steps.
 */
export function approachLeft(
  travellerFraction: number,
  cornerFraction: number | undefined,
  legMeters: number,
): number {
  if (cornerFraction === undefined || legMeters <= 0) return 1;
  const metresLeft = (cornerFraction - travellerFraction) * legMeters;
  return Math.min(1, Math.max(0, metresLeft / APPROACH_METERS));
}
