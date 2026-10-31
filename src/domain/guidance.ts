import type { HelpRequest } from './help-message';
import type { PhotoId } from './photo';
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

/** What fills the middle of the guidance screen: the map on foot, a photo elsewhere. */
export type GuidanceVisual =
  | {
      kind: 'map';
      route: 'straight' | 'left' | 'right' | 'arrive';
      /** Pin drawn at the end of the route: the next stop or the destination. */
      marker?: 'stop' | 'destination';
    }
  | {
      kind: 'photo';
      photo: PhotoId;
      /** Which part of the photo stays visible when cropped, as "x% y%". */
      focus: string;
    };

export type GuidanceStep = {
  instruction: Instruction;
  visual: GuidanceVisual;
  /** Position along the trip: leg index and fraction of that leg. */
  legIndex: number;
  legFraction: number;
  remainingMinutes: number;
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
