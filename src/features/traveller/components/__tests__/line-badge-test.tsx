import { render } from '@testing-library/react-native';

import { LineBadge, MetroSign } from '../line-badge';
import { StationName } from '../station-name';

const C3 = { id: 'C3', color: '#1F5FBF', shape: 'square' } as const;
const M1 = { id: 'M1', color: '#6B3FA0', shape: 'pill' } as const;

describe('D9 text components', () => {
  test('LineBadge shows the official id in the network colour', async () => {
    const screen = await render(<LineBadge line={C3} size="md" />);

    expect(screen.getByText('C3')).toBeOnTheScreen();
    expect(screen.getByLabelText('Ligne C3')).toHaveStyle({
      backgroundColor: '#1F5FBF',
      borderRadius: 12,
    });
  });

  test('metro lines are pills', async () => {
    const screen = await render(<LineBadge line={M1} size="sm" />);

    expect(screen.getByLabelText('Ligne M1')).toHaveStyle({ borderRadius: 14 });
  });

  test('MetroSign shows the round M', async () => {
    const screen = await render(<MetroSign color="#6B3FA0" size={72} />);

    expect(screen.getByText('M')).toBeOnTheScreen();
  });

  test('StationName shows the real name', async () => {
    const screen = await render(<StationName name="Gare Centrale" variant="large" />);

    expect(screen.getByText('Gare Centrale')).toHaveStyle({ fontSize: 29 });
  });
});

describe('line text colour', () => {
  test('follows the network sign, white by default', async () => {
    const light = { id: '41', color: '#76C9B6', textColor: '#1B1C1A', shape: 'square' } as const;
    const screen = await render(<LineBadge line={light} size="md" />);

    expect(screen.getByText('41')).toHaveStyle({ color: '#1B1C1A' });
  });
});
