import { findTurns, locateOnPath, pathLength, type LngLat } from './geo';
import type { GuidanceStep } from './guidance';
import type { HelpRequest } from './help-message';
import { isTransitLeg, type Leg, type TransitLeg } from './trip';

// Spec 021: the guidance steps of a real trip, built from its legs, and where the
// traveller is along them from the phone's position.

/** A turn is announced this far before its corner (spec 021), the same on every leg. */
const ANNOUNCE_METERS = 35;
/** After a corner, « straight on » comes back this far along the new street. */
const AFTER_CORNER_METERS = 15;

function helpBefore(next: Leg | undefined, placeName?: string): HelpRequest {
  if (next && isTransitLeg(next)) {
    return next.kind === 'metro'
      ? { kind: 'findMetro', leg: next }
      : { kind: 'findStop', leg: next };
  }
  return { kind: 'findPlace', placeName };
}

/**
 * Straight on, then each turn announced a few metres before its corner, and straight on
 * again once turned: the arrow of a turn never stays up along the next street.
 */
function walkSteps(index: number, path: readonly LngLat[], help: HelpRequest): GuidanceStep[] {
  const meters = pathLength(path);
  const announce = meters > 0 ? ANNOUNCE_METERS / meters : 0;
  const after = meters > 0 ? AFTER_CORNER_METERS / meters : 0;
  const steps: GuidanceStep[] = [
    { instruction: { kind: 'walk', turn: 'straight' }, legIndex: index, legFraction: 0, help },
  ];
  for (const turn of findTurns(path)) {
    const at = Math.max(0.001, turn.fraction - announce);
    if (turn.fraction <= 0.02 || at <= (steps.at(-1)?.legFraction ?? 0)) continue;
    steps.push({
      instruction: { kind: 'walk', turn: turn.direction },
      legIndex: index,
      legFraction: at,
      help,
    });
    const back = Math.min(0.999, turn.fraction + after);
    steps.push({
      instruction: { kind: 'walk', turn: 'straight' },
      legIndex: index,
      legFraction: back,
      help,
    });
  }
  return steps;
}

/** Just after the last step of a leg, and never before 80 % of it. */
function afterLast(steps: readonly GuidanceStep[], index: number): number {
  const last = steps.filter((step) => step.legIndex === index).at(-1)?.legFraction ?? 0;
  return Math.min(0.999, Math.max(0.8, last + 0.001));
}

function transitSteps(index: number, leg: TransitLeg): GuidanceStep[] {
  const metro = leg.kind === 'metro';
  const onBoard: HelpRequest = metro ? { kind: 'getOffMetro', leg } : { kind: 'getOffBus', leg };
  return [
    {
      instruction: { kind: 'waitVehicle', leg },
      legIndex: index,
      legFraction: 0,
      help: metro ? { kind: 'findMetro', leg } : { kind: 'checkStop', leg },
    },
    { instruction: { kind: 'ride', leg }, legIndex: index, legFraction: 0.05, help: onBoard },
    { instruction: { kind: 'getOffSoon', leg }, legIndex: index, legFraction: 0.85, help: onBoard },
    {
      instruction: metro ? { kind: 'leaveStation' } : { kind: 'gotOff' },
      legIndex: index,
      legFraction: 1,
      help: onBoard,
    },
  ];
}

/** Every step of a trip, in order; the last one walks to the destination. */
export function buildGuidance(legs: readonly Leg[], placeName?: string): GuidanceStep[] {
  const steps: GuidanceStep[] = [];
  legs.forEach((leg, index) => {
    if (isTransitLeg(leg)) {
      steps.push(...transitSteps(index, leg));
      return;
    }
    const next = legs[index + 1];
    const help = helpBefore(next, placeName);
    steps.push(...walkSteps(index, leg.path, help));
    if (next && isTransitLeg(next)) {
      steps.push({
        instruction: { kind: 'reachStop', leg: next },
        legIndex: index,
        legFraction: afterLast(steps, index),
        help,
      });
    }
  });
  const last = legs.at(-1);
  if (last && !isTransitLeg(last)) {
    steps.push({
      instruction: { kind: 'walkToDestination' },
      legIndex: legs.length - 1,
      legFraction: afterLast(steps, legs.length - 1),
      help: { kind: 'findPlace', placeName },
    });
  }
  return steps;
}

/** Off the path by more than this, the position does not move the guidance on. */
const ON_PATH_METERS = 60;

/** Where the traveller stands on the trip: the leg nearest to them, now or next. */
export function locateOnTrip(
  legs: readonly Leg[],
  fromLeg: number,
  point: LngLat,
): { legIndex: number; fraction: number } | undefined {
  const currentLeg = legs[fromLeg];
  const nextLeg = legs[fromLeg + 1];
  const here = currentLeg ? locateOnPath(currentLeg.path, point) : undefined;
  const next = nextLeg ? locateOnPath(nextLeg.path, point) : undefined;
  const nearCurrent = here && here.offMeters <= ON_PATH_METERS ? here : undefined;
  const nearNext = next && next.offMeters <= ON_PATH_METERS ? next : undefined;
  // At the end of a leg, the next one wins (off the bus, walking along its line).
  if (
    nearNext &&
    (!nearCurrent || nearCurrent.fraction >= 0.95 || nearNext.offMeters < nearCurrent.offMeters)
  ) {
    return { legIndex: fromLeg + 1, fraction: nearNext.fraction };
  }
  return nearCurrent && { legIndex: fromLeg, fraction: nearCurrent.fraction };
}

/**
 * The step the traveller has reached, from their position (spec 021): never back, and only
 * when the position lies on the current leg or the next one. Undefined: no change.
 */
export function stepAt(
  steps: readonly GuidanceStep[],
  legs: readonly Leg[],
  current: number,
  point: LngLat,
): number | undefined {
  const step = steps[current];
  if (!step) return undefined;
  const located = locateOnTrip(legs, step.legIndex, point);
  if (!located) return undefined;
  let reached = current;
  steps.forEach((candidate, index) => {
    if (index <= reached) return;
    const ahead =
      candidate.legIndex < located.legIndex ||
      (candidate.legIndex === located.legIndex && candidate.legFraction <= located.fraction);
    if (ahead) reached = index;
  });
  return reached > current ? reached : undefined;
}
