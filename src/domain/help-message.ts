import type { TransitLeg } from './trip';

// What the traveller needs from a passer-by at a given moment of the trip (D9, D10).
export type HelpRequest =
  | { kind: 'findStop'; leg: TransitLeg }
  | { kind: 'checkStop'; leg: TransitLeg }
  | { kind: 'getOffBus'; leg: TransitLeg }
  | { kind: 'findMetro'; leg: TransitLeg }
  | { kind: 'getOffMetro'; leg: TransitLeg }
  | { kind: 'findPlace'; placeName?: string };

/** The French message shown to a passer-by, and read aloud on request. */
export function helpMessage(request: HelpRequest): string {
  switch (request.kind) {
    case 'findStop':
      return `Bonjour, je cherche l'arrêt ${request.leg.from}. Pouvez-vous m'indiquer où il se trouve, s'il vous plaît ?`;
    case 'checkStop':
      return `Bonjour, je cherche le bus ${request.leg.line.id} en direction de ${request.leg.direction}. Suis-je au bon arrêt ?`;
    case 'getOffBus':
      return `Bonjour, je dois descendre à ${request.leg.to}. Pouvez-vous m'aider à reconnaître cet arrêt ?`;
    case 'findMetro':
      return `Bonjour, où puis-je prendre le métro ${request.leg.line.id} en direction de ${request.leg.direction} ?`;
    case 'getOffMetro':
      return `Bonjour, je dois descendre à la station ${request.leg.to}. Pouvez-vous m'indiquer quand nous y arrivons ?`;
    case 'findPlace':
      return `Bonjour, je cherche ${request.placeName ?? 'ce lieu'}. Pouvez-vous m'aider à trouver ce lieu, s'il vous plaît ?`;
    default: {
      const unknown: never = request;
      return unknown;
    }
  }
}
