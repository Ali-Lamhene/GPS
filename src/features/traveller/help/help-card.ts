import { helpMessage, type HelpRequest } from '@/domain/help-message';
import type { Place } from '@/domain/place';
import type { TransitLine } from '@/domain/trip';
import type { IconName } from '@/ui/icon/icon';

export type HelpCard = {
  /** Pictograms that tell the passer-by what the traveller is looking for. */
  icons: IconName[];
  line?: TransitLine;
  /** The traveller's own photo of the destination, if any. */
  photo?: string;
  /** French message for the passer-by (D9). */
  message: string;
};

/** What the help card shows for the traveller's current need (mockup v7, E24). */
export function helpCard(request: HelpRequest, destination?: Place): HelpCard {
  switch (request.kind) {
    case 'findStop':
      return withLeg(['directions_walk', 'directions_bus'], request);
    case 'checkStop':
      return withLeg(['directions_bus'], request);
    case 'getOffBus':
      return withLeg(['directions_bus'], request);
    case 'findMetro':
      return withLeg(['subway'], request);
    case 'getOffMetro':
      return withLeg(['subway'], request);
    case 'findPlace':
      return {
        icons: ['directions_walk', destination?.icon ?? 'flag'],
        photo: destination?.photo,
        message: helpMessage({ kind: 'findPlace', placeName: destination?.helpName }),
      };
    default: {
      const unknown: never = request;
      return unknown;
    }
  }
}

function withLeg(icons: IconName[], request: Extract<HelpRequest, { leg: unknown }>): HelpCard {
  return { icons, line: request.leg.line, message: helpMessage(request) };
}
