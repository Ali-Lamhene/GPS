import { act, fireEvent, screen, within } from '@testing-library/react-native';
import { router } from 'expo-router';
import { BackHandler } from 'react-native';

import { layout, renderWithProviders } from '@/testing/render-with-providers';

import { playCue } from '@/services/feedback';

import { HomePanel } from '../home-panel';
import { lastTileShown, tileLayout } from '../place-tile';
import { HomeScreen } from '../home-screen';
import { WayCard } from '../../components/way-card';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/services/feedback', () => ({ playCue: jest.fn() }));

async function renderHome() {
  await renderWithProviders(<HomeScreen />);
}

const button = (name: string) => screen.getByRole('button', { name });

async function choose(name: string) {
  await fireEvent.press(button(name));
}

describe('<HomeScreen />', () => {
  beforeEach(() => {
    jest.mocked(router.push).mockClear();
    jest.mocked(playCue).mockClear();
  });

  test('opens with nothing chosen: the start calls, here first among the cards', async () => {
    await renderHome();

    expect(button('Départ')).toBeSelected();
    expect(button('Arrivée')).not.toBeSelected();
    const cards = screen.getAllByRole('button', { name: /^(ma position|mon |la |le |l')/ });
    expect(cards[0]).toHaveProp('accessibilityLabel', 'ma position');
    expect(screen.queryByRole('button', { name: 'Continuer' })).toBeNull();
  });

  test('start, then arrival, then continue', async () => {
    await renderHome();

    await choose('ma position');
    expect(button('Arrivée')).toBeSelected();
    expect(playCue).toHaveBeenCalledWith('select');

    await choose('la plage du Prado');
    expect(button('Arrivée')).not.toBeSelected();

    await fireEvent.press(button('Continuer'));
    expect(router.push).toHaveBeenCalledWith('/mode');
  });

  test('the start is not offered again as the arrival', async () => {
    await renderHome();

    await choose('mon domicile');

    expect(screen.queryByRole('button', { name: 'mon domicile' })).toBeNull();
    expect(button('la plage du Prado')).toBeOnTheScreen();
  });

  test('cancel empties the arrival, which calls again', async () => {
    await renderHome();
    await choose('ma position');
    await choose('la plage du Prado');

    await fireEvent.press(button('Annuler'));

    expect(button('Arrivée')).toBeSelected();
    expect(screen.queryByRole('button', { name: 'Continuer' })).toBeNull();
  });

  const sheetPlace = async (name: string) => {
    await fireEvent(screen.getByTestId('place-grid'), 'layout', layout(320, 400));
    await fireEvent.press(within(screen.getByTestId('place-grid')).getByRole('button', { name }));
  };

  test('touching an end opens every place for it; the choice fills that end', async () => {
    await renderHome();

    await fireEvent.press(button('Arrivée'));
    await sheetPlace('la plage du Prado');

    expect(screen.queryByTestId('place-grid')).toBeNull();
    expect(playCue).toHaveBeenCalledWith('select');
    // The start, still empty, calls next.
    expect(button('Départ')).toBeSelected();
  });

  test('with the arrival chosen first, it is not offered as the start', async () => {
    await renderHome();

    await fireEvent.press(button('Arrivée'));
    await sheetPlace('mon domicile');

    expect(screen.queryByRole('button', { name: 'mon domicile' })).toBeNull();
    await fireEvent.press(button('Départ'));
    await fireEvent(screen.getByTestId('place-grid'), 'layout', layout(320, 400));
    expect(
      within(screen.getByTestId('place-grid')).getByRole('button', { name: 'mon domicile' }),
    ).toBeDisabled();
  });

  test('touching a chosen end lets the traveller change it', async () => {
    await renderHome();
    await choose('ma position');
    await choose('la plage du Prado');

    await fireEvent.press(button('Départ'));
    await sheetPlace('mon domicile');

    expect(screen.queryByTestId('place-grid')).toBeNull();
    expect(button('Continuer')).toBeOnTheScreen();
  });

  test('no « all places » tile any more: the ends open every place', async () => {
    await renderHome();

    expect(screen.queryByRole('button', { name: 'Tous les lieux' })).toBeNull();
  });

  test('the place sheet only chooses: no add tile, no companion text', async () => {
    await renderHome();

    await fireEvent.press(button('Départ'));

    expect(screen.queryByRole('button', { name: 'Enregistrer ma position' })).toBeNull();
    expect(screen.queryByText(/Accompagnant/)).toBeNull();
  });

  test('no help on the home: the floating « + » adds a place', async () => {
    await renderHome();

    expect(screen.queryByRole('button', { name: 'Aide' })).toBeNull();
    expect(button('Ajouter un lieu')).toBeOnTheScreen();
  });
});

describe('« + » on the home', () => {
  beforeEach(() => jest.mocked(router.push).mockClear());

  test('a tap starts a new place where the traveller stands', async () => {
    await renderHome();

    await fireEvent.press(button('Ajouter un lieu'));

    expect(router.push).toHaveBeenCalledWith('/add-place/position');
  });

  test('the small button above it opens the address form for the companion', async () => {
    await renderHome();

    await fireEvent.press(button('Ajouter une adresse (accompagnant)'));

    expect(router.push).toHaveBeenCalledWith('/add-place/address');
  });

  test('companion above « + », in one column (spec 013)', async () => {
    await renderHome();

    const column = button('Ajouter un lieu').parent?.parent;
    const order = within(column as never)
      .getAllByRole('button')
      .map((element) => element.props.accessibilityLabel as string);
    expect(order).toEqual(['Ajouter une adresse (accompagnant)', 'Ajouter un lieu']);
  });
});

describe('a place added with « + »', () => {
  test('is offered among the cards; nothing gets chosen', async () => {
    await renderWithProviders(<HomeScreen />, [
      { type: 'startPlace', source: 'address' },
      { type: 'setDraftIcon', icon: 'local_hospital' },
      { type: 'setDraftName', helpName: "l'hôpital Nord" },
      { type: 'finishPlace' },
    ]);

    expect(button("l'hôpital Nord")).toBeOnTheScreen();
    expect(button('Départ')).toBeSelected();
  });
});

describe('place sheet and Android back', () => {
  test('the back button closes the sheet', async () => {
    const listeners: (() => boolean)[] = [];
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_, listener) => {
      listeners.push(listener as () => boolean);
      return { remove: jest.fn() };
    });
    await renderWithProviders(<HomeScreen />);
    await fireEvent.press(button('Arrivée'));

    await act(() => listeners.at(-1)?.());

    expect(screen.queryByTestId('place-grid')).toBeNull();
  });
});

describe('<WayCard />', () => {
  test('a chosen place kept off the map never shows its photo on the home', async () => {
    await renderWithProviders(
      <WayCard
        origin={{ id: 'home', icon: 'home', photo: 'file:///home.jpg' }}
        destination={{ id: 'gym', icon: 'fitness_center', photo: 'file:///gym.jpg' }}
        onEnd={jest.fn()}
      />,
    );

    const tree = JSON.stringify(screen.toJSON());
    expect(tree).not.toContain('file:///home.jpg');
    expect(tree).toContain('file:///gym.jpg');
  });
});

describe('<HomePanel />', () => {
  const panel = (places: Parameters<typeof HomePanel>[0]['places']) => (
    <HomePanel
      choosing
      places={places}
      onChoose={jest.fn()}
      onCancel={jest.fn()}
      onContinue={jest.fn()}
    />
  );

  test('a card never shows the photo of a place hidden from the map', async () => {
    await renderWithProviders(
      panel([
        { id: 'home', icon: 'home', photo: 'file:///home.jpg' },
        { id: 'aunt', icon: 'family_home', photo: 'file:///aunt.jpg', hiddenOnMap: true },
        { id: 'gym', icon: 'fitness_center', photo: 'file:///gym.jpg' },
      ]),
    );

    const tree = JSON.stringify(screen.toJSON());
    // Home is hidden by default, the other by choice; a place on the map keeps its photo.
    expect(tree).not.toContain('file:///home.jpg');
    expect(tree).not.toContain('file:///aunt.jpg');
    expect(tree).toContain('file:///gym.jpg');
  });

  test('shows every place as a shortcut, and nothing after them', async () => {
    const places = Array.from({ length: 10 }, (_, index) => ({
      id: `place-${index}`,
      icon: 'home' as const,
      helpName: `lieu ${index}`,
    }));
    await renderWithProviders(panel(places));

    expect(screen.getAllByRole('button')).toHaveLength(10);
  });
});

describe('tileLayout', () => {
  // Visible rail width on a phone: screen width minus two gutters (14) and the rail padding (12).
  test.each([320, 360, 390, 393, 412, 1000])(
    'at %i dp, tiles of 56 to 64 dp and the last one cut between 40 and 65 percent (spec 012)',
    (screen) => {
      const visible = screen - 2 * 14 - 12;
      const layout = tileLayout(visible);
      expect(layout.size).toBeGreaterThanOrEqual(56);
      expect(layout.size).toBeLessThanOrEqual(64);
      expect(layout.gap).toBeGreaterThanOrEqual(8);
      expect(layout.gap).toBeLessThanOrEqual(14);
      const shown = lastTileShown(visible, layout);
      expect(shown).toBeGreaterThanOrEqual(0.4);
      expect(shown).toBeLessThanOrEqual(0.65);
    },
  );

  test('64 dp tiles at the reference width of 390 dp', () => {
    expect(tileLayout(390 - 2 * 14 - 12).size).toBe(64);
  });
});
