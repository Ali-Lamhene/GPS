import { DEMO_BUS_LEG, DEMO_METRO_LEG } from '../../demo/trips';
import { helpCard } from '../help-card';

describe('helpCard', () => {
  test('at the bus stop, shows the line and asks for the right bus', () => {
    const card = helpCard({ kind: 'checkStop', leg: DEMO_BUS_LEG });

    expect(card).toMatchObject({
      icons: ['directions_bus'],
      line: DEMO_BUS_LEG.line,
    });
    expect(card.photo).toBeUndefined();
    expect(card.message).toContain('le bus 41 en direction de Vieux Port Ballard');
  });

  test('in the metro, shows the metro line and asks when to get off', () => {
    const card = helpCard({ kind: 'getOffMetro', leg: DEMO_METRO_LEG });

    expect(card).toMatchObject({ icons: ['subway'], line: DEMO_METRO_LEG.line });
    expect(card.message).toContain('la station Saint-Charles');
  });

  test('on foot, asks for the destination with its pictogram and photo', () => {
    const card = helpCard(
      { kind: 'findPlace' },
      {
        id: 'c',
        icon: 'local_hospital',
        photo: 'file:///hospital.jpg',
        helpName: "l'hôpital Nord",
      },
    );

    expect(card).toEqual({
      icons: ['directions_walk', 'local_hospital'],
      photo: 'file:///hospital.jpg',
      message:
        "Bonjour, je cherche l'hôpital Nord. Pouvez-vous m'aider à trouver ce lieu, s'il vous plaît ?",
    });
  });
});
