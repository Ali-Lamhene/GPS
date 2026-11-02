import { act, fireEvent, screen, within } from '@testing-library/react-native';
import { router } from 'expo-router';
import { BackHandler } from 'react-native';

import { layout, renderWithProviders } from '@/testing/render-with-providers';

import { playCue } from '@/services/feedback';

import { cardSize, HomePanel } from '../home-panel';
import { HomeScreen } from '../home-screen';
import { WayCard } from '../way-card';

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

  test('touching a chosen end opens it again', async () => {
    await renderHome();
    await choose('ma position');
    await choose('la plage du Prado');

    await fireEvent.press(button('Départ'));

    expect(button('Départ')).toBeSelected();
    expect(button('ma position')).toBeOnTheScreen();

    await choose('mon domicile');
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeOnTheScreen();
  });

  test('touching the reopened end again closes it: a stray touch is undone', async () => {
    await renderHome();
    await choose('ma position');
    await choose('la plage du Prado');

    await fireEvent.press(button('Départ'));
    await fireEvent.press(button('Départ'));

    expect(button('Départ')).not.toBeSelected();
    expect(button('Continuer')).toBeOnTheScreen();
  });

  test('« all places » opens the sheet for the end that calls', async () => {
    await renderHome();

    await fireEvent.press(button('Tous les lieux'));
    await fireEvent(screen.getByTestId('place-grid'), 'layout', layout(320, 400));
    await fireEvent.press(
      within(screen.getByTestId('place-grid')).getByRole('button', { name: 'mon domicile' }),
    );

    expect(screen.queryByTestId('place-grid')).toBeNull();
    expect(button('Arrivée')).toBeSelected();
  });

  test('the place sheet only chooses: no add tile, no companion text', async () => {
    await renderHome();

    await fireEvent.press(button('Tous les lieux'));

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
  beforeEach(() => {
    jest.useFakeTimers();
    jest.mocked(router.push).mockClear();
  });
  afterEach(() => jest.useRealTimers());

  const plus = () => button('Ajouter un lieu');

  test('a tap starts a new place where the traveller stands', async () => {
    await renderHome();

    await fireEvent.press(plus());

    expect(router.push).toHaveBeenCalledWith('/add-place/position');
  });

  test('a 3 second hold opens the address form for the companion', async () => {
    await renderHome();

    await fireEvent(plus(), 'pressIn');
    await act(() => jest.advanceTimersByTime(2900));
    expect(router.push).not.toHaveBeenCalled();

    await act(() => jest.advanceTimersByTime(200));
    expect(router.push).toHaveBeenCalledWith('/add-place/address');
    // Felt in the hand: the companion knows the form is opening.
    expect(playCue).toHaveBeenCalledWith('hold');
  });

  test('a hold released early opens nothing', async () => {
    await renderHome();

    await fireEvent(plus(), 'pressIn');
    await act(() => jest.advanceTimersByTime(1500));
    await fireEvent(plus(), 'pressOut');
    await act(() => jest.advanceTimersByTime(3000));

    expect(router.push).not.toHaveBeenCalled();
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
    await fireEvent.press(button('Tous les lieux'));

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
      onAllPlaces={jest.fn()}
      onChoose={jest.fn()}
      onCancel={jest.fn()}
      onContinue={jest.fn()}
    />
  );

  test('a card never shows the photo of a place hidden from the map', async () => {
    await renderWithProviders(
      panel([
        { id: 'home', icon: 'home', photo: 'file:///home.jpg' },
        { id: 'aunt', icon: 'family_restroom', photo: 'file:///aunt.jpg', hiddenOnMap: true },
        { id: 'gym', icon: 'fitness_center', photo: 'file:///gym.jpg' },
      ]),
    );

    const tree = JSON.stringify(screen.toJSON());
    // Home is hidden by default, the other by choice; a place on the map keeps its photo.
    expect(tree).not.toContain('file:///home.jpg');
    expect(tree).not.toContain('file:///aunt.jpg');
    expect(tree).toContain('file:///gym.jpg');
  });

  test('shows every place, then « all places » last', async () => {
    const places = Array.from({ length: 10 }, (_, index) => ({
      id: `place-${index}`,
      icon: 'home' as const,
      helpName: `lieu ${index}`,
    }));
    await renderWithProviders(panel(places));

    const buttons = screen.getAllByRole('button', { name: /^(lieu |Tous les lieux)/ });
    expect(buttons).toHaveLength(11);
    expect(buttons.at(-1)).toHaveProp('accessibilityLabel', 'Tous les lieux');
  });
});

describe('cardSize', () => {
  test('about three quarters of the screen wide, at least 200 high, capped on a tablet', () => {
    expect(cardSize(360)).toEqual({ width: 270, height: 221 });
    expect(cardSize(320).height).toBe(200);
    expect(cardSize(1024).width).toBe(360);
  });
});
