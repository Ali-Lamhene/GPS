import { render, screen } from '@testing-library/react-native';

import { DEMO_BUS_LEG, DEMO_METRO_LEG } from '../../demo/trips';
import { LineProgress } from '../line-progress';

describe('<LineProgress />', () => {
  test('lists every station of the leg, from boarding to getting off', async () => {
    await render(<LineProgress leg={DEMO_BUS_LEG} fraction={0.5} />);

    for (const name of [
      'Place de la Corderie',
      'Fort Notre-Dame',
      'Place aux Huiles',
      'Vieux Port Ballard',
    ]) {
      expect(screen.getByText(name)).toBeOnTheScreen();
    }
  });

  test('the station to get off at stands out', async () => {
    await render(<LineProgress leg={DEMO_METRO_LEG} fraction={0.6} />);

    expect(screen.getByText('Saint-Charles')).toHaveStyle({ fontSize: 29 });
    expect(screen.getByText('Colbert')).toHaveStyle({ fontSize: 17 });
  });
});
