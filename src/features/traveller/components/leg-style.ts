import type { Leg } from '@/domain/trip';
import type { IconName } from '@/ui/icon/icon';
import { colors } from '@/ui/theme';

const LEG_ICONS: Record<Leg['kind'], IconName> = {
  walk: 'directions_walk',
  bus: 'directions_bus',
  metro: 'subway',
  car: 'directions_car',
};

export function legIcon(leg: Leg): IconName {
  return LEG_ICONS[leg.kind];
}

/** Colour of a leg on rails and progress strips: the line colour, grey on foot. */
export function legColor(leg: Leg): string {
  if (leg.kind === 'bus' || leg.kind === 'metro') return leg.line.color;
  return leg.kind === 'car' ? colors.car : colors.walkRail;
}
