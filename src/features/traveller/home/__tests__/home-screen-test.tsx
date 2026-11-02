import { act, fireEvent, screen, within } from '@testing-library/react-native';
import { router } from 'expo-router';
import { BackHandler } from 'react-native';

import { layout, renderWithProviders } from '@/testing/render-with-providers';

import { playCue } from '@/services/feedback';

import { CURRENT_POSITION } from '@/domain/place';

import { HomePanel } from '../home-panel';
import { HomeScreen } from '../home-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/services/feedback', () => ({ playCue: jest.fn() }));

async function renderHome() {
  await renderWithProviders(<HomeScreen />);
}

async function openSheet(end: 'Départ' | 'Arrivée') {
  await fireEvent.press(screen.getByRole('button', { name: end }));
  await fireEvent(screen.getByTestId('place-grid'), 'layout', layout(320, 400));
}

async function choose(end: 'Départ' | 'Arrivée', place: string) {
  await openSheet(end);
  await fireEvent.press(
    within(screen.getByTestId('place-grid')).getByRole('button', { name: place }),
  );
}

describe('<HomeScreen />', () => {
  beforeEach(() => jest.mocked(router.push).mockClear());

  test('starts here, with only the arrival left to choose', async () => {
    await renderHome();

    expect(screen.getByRole('button', { name: 'Départ' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Arrivée' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Tous les lieux' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Continuer' })).toBeNull();
  });

  test('a shortcut chooses the arrival; cancel brings the shortcuts back', async () => {
    await renderHome();

    await fireEvent.press(screen.getByRole('button', { name: 'mon domicile' }));
    expect(playCue).toHaveBeenCalledWith('select');
    expect(screen.queryByRole('button', { name: 'mon domicile' })).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Annuler' }));
    expect(screen.queryByRole('button', { name: 'Continuer' })).toBeNull();
    expect(screen.getByRole('button', { name: 'mon domicile' })).toBeOnTheScreen();
  });

  test('a shortcut never shows the photo of a place hidden from the map', async () => {
    await renderWithProviders(
      <HomePanel
        origin={CURRENT_POSITION}
        places={[
          { id: 'home', icon: 'home', photo: 'file:///home.jpg' },
          { id: 'aunt', icon: 'family_restroom', photo: 'file:///aunt.jpg', hiddenOnMap: true },
          { id: 'gym', icon: 'fitness_center', photo: 'file:///gym.jpg' },
        ]}
        onOrigin={jest.fn()}
        onAllPlaces={jest.fn()}
        onChoose={jest.fn()}
        onCancel={jest.fn()}
        onContinue={jest.fn()}
      />,
    );

    const tree = JSON.stringify(screen.toJSON());
    // Home is hidden by default, the other by choice; a place on the map keeps its photo.
    expect(tree).not.toContain('file:///home.jpg');
    expect(tree).not.toContain('file:///aunt.jpg');
    expect(tree).toContain('file:///gym.jpg');
  });

  test('« all places » opens the sheet of arrivals', async () => {
    await renderHome();

    await fireEvent.press(screen.getByRole('button', { name: 'Tous les lieux' }));

    expect(screen.getByTestId('place-grid')).toBeOnTheScreen();
  });

  test('choosing the arrival plays the select sound and offers to continue', async () => {
    await renderHome();

    await choose('Arrivée', 'la plage du Prado');
    expect(screen.queryByTestId('place-grid')).toBeNull();
    expect(playCue).toHaveBeenCalledWith('select');

    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }));
    expect(router.push).toHaveBeenCalledWith('/mode');
  });

  test('another start can be chosen from the panel', async () => {
    await renderHome();

    await choose('Départ', 'mon domicile');
    await choose('Arrivée', 'la plage du Prado');

    expect(screen.getByRole('button', { name: 'Continuer' })).toBeOnTheScreen();
  });

  test('the start cannot be picked again as the arrival', async () => {
    await renderHome();
    await choose('Départ', 'mon domicile');

    await openSheet('Arrivée');

    expect(
      within(screen.getByTestId('place-grid')).getByRole('button', { name: 'mon domicile' }),
    ).toBeDisabled();
  });

  test('no help on the home: « + » stands in its place', async () => {
    await renderHome();

    expect(screen.queryByRole('button', { name: 'Aide' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Ajouter un lieu' })).toBeOnTheScreen();
  });

  test('the place sheet only chooses: no add tile, no companion text', async () => {
    await renderHome();
    await openSheet('Arrivée');

    expect(screen.queryByRole('button', { name: 'Enregistrer ma position' })).toBeNull();
    expect(screen.queryByText(/Accompagnant/)).toBeNull();
  });
});

describe('« + » on the home', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.mocked(router.push).mockClear();
  });
  afterEach(() => jest.useRealTimers());

  const plus = () => screen.getByRole('button', { name: 'Ajouter un lieu' });

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
  test('shows in the carousel; the arrival stays empty', async () => {
    await renderWithProviders(<HomeScreen />, [
      { type: 'startPlace', source: 'address' },
      { type: 'setDraftIcon', icon: 'local_hospital' },
      { type: 'setDraftName', helpName: "l'hôpital Nord" },
      { type: 'finishPlace' },
    ]);

    expect(screen.getByRole('button', { name: "l'hôpital Nord" })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Continuer' })).toBeNull();
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
    await fireEvent(screen.getByTestId('home-screen'), 'layout', layout(360, 800));
    await fireEvent.press(screen.getByRole('button', { name: 'Départ' }));

    await act(() => listeners.at(-1)?.());

    expect(screen.queryByTestId('place-grid')).toBeNull();
  });
});

describe('shortcuts', () => {
  test('show every place, then « all places » last', async () => {
    const places = Array.from({ length: 10 }, (_, index) => ({
      id: `place-${index}`,
      icon: 'home' as const,
      helpName: `lieu ${index}`,
    }));
    await renderWithProviders(
      <HomePanel
        origin={CURRENT_POSITION}
        places={places}
        onOrigin={jest.fn()}
        onAllPlaces={jest.fn()}
        onChoose={jest.fn()}
        onCancel={jest.fn()}
        onContinue={jest.fn()}
      />,
    );

    const buttons = screen.getAllByRole('button', { name: /^(lieu |Tous les lieux)/ });
    expect(buttons).toHaveLength(11);
    expect(buttons.at(-1)).toHaveProp('accessibilityLabel', 'Tous les lieux');
  });
});
