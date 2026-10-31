import { helpMessage } from '../help-message';
import type { TransitLeg } from '../trip';

const bus: TransitLeg = {
  kind: 'bus',
  minutes: 12,
  line: { id: 'C3', color: '#1F5FBF', shape: 'square' },
  from: 'Jardin des Plantes',
  to: 'Saint-Charles',
  direction: 'Place du Marché',
  path: [],
};
const metro: TransitLeg = { ...bus, kind: 'metro', line: { ...bus.line, id: 'M1' } };

describe('helpMessage', () => {
  test('asks a passer-by for what the traveller needs at this step', () => {
    expect(helpMessage({ kind: 'findStop', leg: bus })).toBe(
      "Bonjour, je cherche l'arrêt Jardin des Plantes. Pouvez-vous m'indiquer où il se trouve, s'il vous plaît ?",
    );
    expect(helpMessage({ kind: 'checkStop', leg: bus })).toBe(
      'Bonjour, je cherche le bus C3 en direction de Place du Marché. Suis-je au bon arrêt ?',
    );
    expect(helpMessage({ kind: 'getOffBus', leg: bus })).toContain('descendre à Saint-Charles');
    expect(helpMessage({ kind: 'findMetro', leg: metro })).toContain('le métro M1 en direction de');
    expect(helpMessage({ kind: 'getOffMetro', leg: metro })).toContain('la station Saint-Charles');
  });

  test('names the place when known, stays generic otherwise', () => {
    expect(helpMessage({ kind: 'findPlace', placeName: 'la plage du Prado' })).toBe(
      "Bonjour, je cherche la plage du Prado. Pouvez-vous m'aider à trouver ce lieu, s'il vous plaît ?",
    );
    expect(helpMessage({ kind: 'findPlace' })).toContain('je cherche ce lieu.');
  });
});
