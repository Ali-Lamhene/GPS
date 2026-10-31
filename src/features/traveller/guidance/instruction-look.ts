import type { Place } from '@/domain/place';
import type { GuidanceStep, Instruction, Turn } from '@/domain/guidance';
import type { Cue } from '@/services/feedback';
import type { IconName } from '@/ui/icon/icon';

const TURN_ICONS: Record<Turn, IconName> = {
  straight: 'straight',
  left: 'turn_left',
  right: 'turn_right',
};

/** Big pictogram of the instruction card; `metro` means the round "M" sign instead. */
export function mainSymbol(instruction: Instruction): IconName | 'metro' {
  switch (instruction.kind) {
    case 'walk':
      return TURN_ICONS[instruction.turn];
    case 'walkToDestination':
      return 'straight';
    case 'reachStop':
    case 'waitVehicle':
    case 'ride':
      return instruction.leg.kind === 'metro' ? 'metro' : 'directions_bus';
    case 'getOffSoon':
      return 'notifications_active';
    case 'gotOff':
      return 'logout';
    case 'leaveStation':
      return 'stairs';
    default: {
      const unknown: never = instruction;
      return unknown;
    }
  }
}

/** Smaller pictogram of what comes next, shown beside the main one. */
export function nextSymbol(instruction: Instruction, destination?: Place): IconName | undefined {
  switch (instruction.kind) {
    case 'gotOff':
      return 'directions_walk';
    case 'leaveStation':
      return 'north';
    case 'walkToDestination':
      return destination?.icon ?? 'flag';
    default:
      return undefined;
  }
}

/** Sound and vibration when a step appears (mockup v7). */
export function stepCue(step: GuidanceStep): Cue | undefined {
  if (step.offline) return 'offline';
  const { instruction } = step;
  switch (instruction.kind) {
    case 'walk':
      return instruction.turn === 'straight' ? undefined : 'turn';
    case 'getOffSoon':
      return 'alert';
    case 'waitVehicle':
      return 'vehicle';
    case 'gotOff':
    case 'leaveStation':
      return 'exit';
    default:
      return undefined;
  }
}
