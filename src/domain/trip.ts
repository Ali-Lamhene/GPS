import type { PhotoId } from './photo';

export type TravelMode = 'walk' | 'transit' | 'car';

export type TransitLine = {
  /** Official line id shown on the network signs (D9), e.g. "C3", "M1". */
  id: string;
  color: string;
  /** Bus lines are drawn as rounded squares, metro lines as pills. */
  shape: 'square' | 'pill';
};

export type TransitLeg = {
  kind: 'bus' | 'metro';
  minutes: number;
  line: TransitLine;
  /** Real stop or station names (D9). */
  from: string;
  to: string;
  direction: string;
  photo?: PhotoId;
};

export type Leg = { kind: 'walk'; minutes: number } | { kind: 'car'; minutes: number } | TransitLeg;

export function isTransitLeg(leg: Leg): leg is TransitLeg {
  return leg.kind === 'bus' || leg.kind === 'metro';
}

export function totalMinutes(legs: readonly Leg[]): number {
  return legs.reduce((sum, leg) => sum + leg.minutes, 0);
}

/**
 * Where the traveller is along the whole trip, from 0 to 1, given the leg they are on
 * and how far along that leg (0 to 1).
 */
export function tripProgress(legs: readonly Leg[], legIndex: number, legFraction: number): number {
  const total = totalMinutes(legs);
  if (total === 0) return 0;

  const done = totalMinutes(legs.slice(0, legIndex));
  const current = legs[legIndex]?.minutes ?? 0;
  const fraction = Math.min(1, Math.max(0, legFraction));
  return Math.min(1, (done + fraction * current) / total);
}
