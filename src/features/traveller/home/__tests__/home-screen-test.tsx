import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import { router } from 'expo-router';
import { BackHandler } from 'react-native';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { layout, renderWithProviders } from '@/testing/render-with-providers';

import { playCue } from '@/services/feedback';

import { HomeWay } from '../home-way';
import { HomeScreen } from '../home-screen';
import { LocationProvider } from '../../location/location-context';
import { TripPlanProvider } from '../../trip-plan/trip-plan-context';
import { WayCard } from '../../components/way-card';
import { DEMO_CURRENT_POSITION } from '@/testing/fixtures/trips';
import { useNetworkState } from 'expo-network';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  // The home in front: its focus effect runs once mounted.
  useFocusEffect: (effect: () => void) => jest.requireActual('react').useEffect(effect, [effect]),
}));
jest.mock('@/services/feedback', () => ({ playCue: jest.fn() }));
// The map draws its pins: like the native marker, the marker itself takes the press.
jest.mock('@maplibre/maplibre-react-native', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Pressable, View } = jest.requireActual<typeof import('react-native')>('react-native');
  const container = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(View, null, children);
  const Camera = React.forwardRef((_props: object, ref: React.Ref<unknown>) => {
    React.useImperativeHandle(ref, () => ({ easeTo: jest.fn(), fitBounds: jest.fn() }));
    return null;
  });
  Camera.displayName = 'Camera';
  const Marker = ({ children, onPress }: { children?: React.ReactNode; onPress?: () => void }) =>
    React.createElement(Pressable, { onPress, disabled: !onPress }, children);
  return {
    Map: container,
    Camera,
    GeoJSONSource: container,
    Layer: () => null,
    Marker,
    NetworkManager: { setConnected: jest.fn() },
    LogManager: { setLogLevel: jest.fn(), onLog: jest.fn() },
    TransformRequestManager: { addUrlTransform: jest.fn(), addHeader: jest.fn() },
    OfflineManager: { clearAmbientCache: jest.fn(() => Promise.resolve()) },
  };
});

async function renderHome() {
  await renderWithProviders(<HomeScreen />);
}

const button = (name: string) => screen.getByRole('button', { name });
/** A pin of the map, found by the name of its place (the sheet must be closed). */
const pin = (name: string) => screen.findByRole('button', { name });

async function sheetPlace(name: string) {
  await fireEvent(screen.getByTestId('place-grid'), 'layout', layout(320, 400));
  await fireEvent.press(within(screen.getByTestId('place-grid')).getByRole('button', { name }));
}

describe('<HomeScreen />', () => {
  beforeEach(() => {
    jest.mocked(router.push).mockClear();
    jest.mocked(playCue).mockClear();
  });

  test('opens with nothing chosen: the start calls, and no shortcut tiles (spec 035)', async () => {
    await renderHome();

    expect(button('Départ')).toBeSelected();
    expect(button('Arrivée')).not.toBeSelected();
    // « Here » is no tile any more: only the traveller's own dot on the map offers it.
    expect(screen.getAllByRole('button', { name: 'ma position' })).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Continuer' })).toBeNull();
    // The rail of shortcuts is gone: nothing scrolls sideways.
    expect(JSON.stringify(screen.toJSON())).not.toContain('"horizontal"');
  });

  test('a whole trip on the map alone: a pin for the start, a pin for the arrival, continue', async () => {
    await renderHome();

    await fireEvent.press(await pin('la mairie'));
    expect(button('Arrivée')).toBeSelected();
    expect(playCue).toHaveBeenCalledWith('select');

    await fireEvent.press(await pin('la plage du Prado'));
    expect(button('Arrivée')).not.toBeSelected();

    await fireEvent.press(button('Continuer'));
    expect(router.push).toHaveBeenCalledWith('/mode');
  });

  test('a whole trip on the map alone from here: the dot, a pin, continue (spec 035)', async () => {
    await renderHome();

    await fireEvent.press(button('ma position'));
    expect(button('Arrivée')).toBeSelected();
    expect(playCue).toHaveBeenCalledWith('select');
    // The start is chosen: the dot is no button any more.
    expect(screen.queryByRole('button', { name: 'ma position' })).toBeNull();

    await fireEvent.press(await pin('la plage du Prado'));
    await fireEvent.press(button('Continuer'));

    expect(router.push).toHaveBeenCalledWith('/mode');
  });

  test('the dot also gives the start when the arrival was chosen first', async () => {
    await renderHome();
    await fireEvent.press(button('Arrivée'));
    await sheetPlace('la plage du Prado');

    await fireEvent.press(button('ma position'));

    expect(button('Continuer')).toBeOnTheScreen();
  });

  test('no position, no dot: nothing to touch on the map for « here »', async () => {
    await renderWithProviders(<HomeScreen />, [], { kind: 'unavailable' });

    expect(screen.queryByRole('button', { name: 'ma position' })).toBeNull();
  });

  test('the two ways mix: a pin for the start, the arrival from its end of the way', async () => {
    await renderHome();

    await fireEvent.press(await pin('la mairie'));
    await fireEvent.press(button('Arrivée'));
    await sheetPlace('la plage du Prado');

    await fireEvent.press(button('Continuer'));
    expect(router.push).toHaveBeenCalledWith('/mode');
  });

  test('the start sheet offers « here » first', async () => {
    await renderHome();

    await fireEvent.press(button('Départ'));
    await fireEvent(screen.getByTestId('place-grid'), 'layout', layout(320, 400));

    const first = within(screen.getByTestId('place-grid')).getAllByRole('button')[0];
    expect(first).toHaveProp('accessibilityLabel', 'ma position');
  });

  test('start, then arrival, then continue, by the ends of the way', async () => {
    await renderHome();

    await fireEvent.press(button('Départ'));
    await sheetPlace('ma position');
    expect(button('Arrivée')).toBeSelected();
    expect(playCue).toHaveBeenCalledWith('select');

    await fireEvent.press(button('Arrivée'));
    await sheetPlace('la plage du Prado');
    expect(button('Arrivée')).not.toBeSelected();

    await fireEvent.press(button('Continuer'));
    expect(router.push).toHaveBeenCalledWith('/mode');
  });

  test('the start is not offered again as the arrival', async () => {
    await renderHome();

    await fireEvent.press(await pin('la mairie'));
    await fireEvent.press(button('Arrivée'));
    await fireEvent(screen.getByTestId('place-grid'), 'layout', layout(320, 400));

    expect(
      within(screen.getByTestId('place-grid')).getByRole('button', { name: 'la mairie' }),
    ).toBeDisabled();
  });

  test('the pin of the other end is ignored, without a sound (spec 035)', async () => {
    await renderHome();
    await fireEvent.press(button('Arrivée'));
    await sheetPlace('la plage du Prado');
    jest.mocked(playCue).mockClear();

    // The arrival is chosen, the start still calls: its pin must not empty the arrival.
    await fireEvent.press(await pin('la plage du Prado'));

    expect(playCue).not.toHaveBeenCalled();
    expect(button('Départ')).toBeSelected();
    expect(button('Arrivée')).not.toBeSelected();
    await fireEvent.press(await pin('la mairie'));
    expect(button('Continuer')).toBeOnTheScreen();
  });

  test('both ends chosen: the start pin changes nothing and stays silent', async () => {
    await renderHome();
    await fireEvent.press(await pin('la mairie'));
    await fireEvent.press(await pin('la plage du Prado'));
    jest.mocked(playCue).mockClear();

    await fireEvent.press(await pin('la mairie'));

    expect(playCue).not.toHaveBeenCalled();
    expect(button('Continuer')).toBeOnTheScreen();
  });

  test('both ends chosen: « + » and the companion button are gone, ✓ is alone (spec 035)', async () => {
    await renderHome();
    expect(button('Ajouter un lieu')).toBeOnTheScreen();

    await fireEvent.press(await pin('la mairie'));
    await fireEvent.press(await pin('la plage du Prado'));

    expect(screen.queryByRole('button', { name: 'Ajouter un lieu' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Ajouter une adresse (accompagnant)' })).toBeNull();
  });

  test('cancel empties the arrival, which calls again', async () => {
    await renderHome();
    await fireEvent.press(await pin('la mairie'));
    await fireEvent.press(await pin('la plage du Prado'));

    await fireEvent.press(button('Annuler'));

    expect(button('Arrivée')).toBeSelected();
    expect(screen.queryByRole('button', { name: 'Continuer' })).toBeNull();
  });

  test('cancel and continue sit above the way, which stays where it is (spec 035)', async () => {
    await renderHome();
    await fireEvent.press(await pin('la mairie'));
    await fireEvent.press(await pin('la plage du Prado'));

    const block = button('Départ').parent?.parent;
    const order = within(block as never)
      .getAllByRole('button')
      .map((element) => element.props.accessibilityLabel as string);
    expect(order).toEqual(['Annuler', 'Continuer', 'Départ', 'Arrivée']);
  });

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

    expect(screen.queryByTestId('place-grid')).toBeNull();
    await fireEvent.press(button('Départ'));
    await fireEvent(screen.getByTestId('place-grid'), 'layout', layout(320, 400));
    expect(
      within(screen.getByTestId('place-grid')).getByRole('button', { name: 'mon domicile' }),
    ).toBeDisabled();
  });

  test('touching a chosen end lets the traveller change it', async () => {
    await renderHome();
    await fireEvent.press(await pin('la mairie'));
    await fireEvent.press(await pin('la plage du Prado'));

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

  test("« + » is 64 dp, the traveller's main button (spec 035)", async () => {
    await renderHome();

    expect(button('Ajouter un lieu')).toHaveStyle({ width: 64, height: 64, borderRadius: 32 });
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
  test('is offered in the place sheet; nothing gets chosen', async () => {
    await renderWithProviders(<HomeScreen />, [
      {
        type: 'addPlace',
        place: { id: 'p1', icon: 'local_hospital', helpName: "l'hôpital Nord", createdAt: 1 },
      },
    ]);

    expect(button('Départ')).toBeSelected();
    await fireEvent.press(button('Arrivée'));
    await fireEvent(screen.getByTestId('place-grid'), 'layout', layout(320, 400));
    expect(
      within(screen.getByTestId('place-grid')).getByRole('button', { name: "l'hôpital Nord" }),
    ).toBeOnTheScreen();
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
  test('a chosen home shows its photo on the home like any place (hiddenOnMap lifted, 2026-11-17)', async () => {
    await renderWithProviders(
      <WayCard
        origin={{ id: 'home', icon: 'home', photo: 'file:///home.jpg' }}
        destination={{ id: 'gym', icon: 'fitness_center', photo: 'file:///gym.jpg' }}
        onEnd={jest.fn()}
      />,
    );

    const tree = JSON.stringify(screen.toJSON());
    expect(tree).toContain('file:///home.jpg');
    expect(tree).toContain('file:///gym.jpg');
  });
});

describe('<HomeWay />', () => {
  const way = (props: Partial<Parameters<typeof HomeWay>[0]> = {}) => (
    <HomeWay onEnd={jest.fn()} onCancel={jest.fn()} onContinue={jest.fn()} {...props} />
  );
  const gym = { id: 'gym', icon: 'fitness_center', helpName: 'la salle de sport' } as const;
  const city = { id: 'city', icon: 'location_city', helpName: 'la mairie' } as const;

  test('with an end to fill: the way only, no cancel and no continue', async () => {
    await renderWithProviders(way({ calling: 'origin' }));

    expect(screen.queryByRole('button', { name: 'Annuler' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Continuer' })).toBeNull();
    expect(button('Départ')).toBeSelected();
  });

  test('both ends chosen: cancel and continue appear', async () => {
    const onCancel = jest.fn();
    const onContinue = jest.fn();
    await renderWithProviders(way({ origin: gym, destination: city, onCancel, onContinue }));

    await fireEvent.press(button('Annuler'));
    await fireEvent.press(button('Continuer'));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  test('a touch on an end gives that end, chosen or not', async () => {
    const onEnd = jest.fn();
    await renderWithProviders(way({ origin: gym, destination: city, onEnd }));

    await fireEvent.press(button('Départ'));
    await fireEvent.press(button('Arrivée'));

    expect(onEnd).toHaveBeenNthCalledWith(1, 'origin');
    expect(onEnd).toHaveBeenNthCalledWith(2, 'destination');
  });

  test('reports the room it takes, so the map frames above it', async () => {
    const onHeight = jest.fn();
    await renderWithProviders(way({ calling: 'origin', onHeight }));

    await fireEvent(button('Départ').parent?.parent as never, 'layout', layout(300, 72));

    // 72 dp of way plus the 14 dp gutter under it (no inset in tests).
    expect(onHeight).toHaveBeenCalledWith(86);
  });
});

describe('home on the first start, without any place (spec 015)', () => {
  const metrics = {
    frame: { x: 0, y: 0, width: 360, height: 800 },
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };
  const renderEmpty = (actions: Parameters<typeof TripPlanProvider>[0]['initialActions'] = []) =>
    render(
      <SafeAreaProvider initialMetrics={metrics}>
        <LocationProvider fixed={{ kind: 'located', point: DEMO_CURRENT_POSITION }}>
          <TripPlanProvider initialActions={actions}>
            <HomeScreen />
          </TripPlanProvider>
        </LocationProvider>
      </SafeAreaProvider>,
    );

  beforeEach(() => jest.mocked(router.push).mockClear());

  test('no demonstration place: only « here » for the start', async () => {
    await renderEmpty();

    await fireEvent.press(button('Départ'));
    await fireEvent(screen.getByTestId('place-grid'), 'layout', layout(320, 400));

    const grid = within(screen.getByTestId('place-grid'));
    expect(grid.getByRole('button', { name: 'ma position' })).toBeOnTheScreen();
    expect(grid.queryByRole('button', { name: 'la mairie' })).toBeNull();
  });

  test('the arrival offers one dashed « + » tile, which adds a place here', async () => {
    await renderEmpty();
    await fireEvent.press(button('Départ'));
    await sheetPlace('ma position');
    await fireEvent.press(button('Arrivée'));
    await fireEvent(screen.getByTestId('place-grid'), 'layout', layout(320, 400));

    const tiles = screen.getAllByRole('button', { name: 'Ajouter un lieu' });
    expect(tiles).toHaveLength(2);
    await fireEvent.press(tiles[0] as never);

    expect(router.push).toHaveBeenCalledWith('/add-place/position');
  });

  test('a place that could not be saved shows the red cross', async () => {
    await renderEmpty([{ type: 'placeSaveFailed' }]);

    expect(screen.getByTestId('save-failed')).toBeOnTheScreen();
    expect(playCue).toHaveBeenCalledWith('alert');
  });

  test('with one place chosen as the start, the arrival sheet still offers « + »', async () => {
    await renderEmpty([
      { type: 'addPlace', place: { id: 'p1', icon: 'school', createdAt: 1 } },
      { type: 'chooseOrigin', placeId: 'p1' },
    ]);
    await fireEvent.press(button('Arrivée'));

    const grid = screen.getByTestId('place-grid');
    await fireEvent(grid, 'layout', layout(300, 0));
    expect(within(grid).getByRole('button', { name: 'Ajouter un lieu' })).toBeOnTheScreen();
  });
});

describe('home with the real position (spec 017)', () => {
  beforeEach(() => jest.mocked(router.push).mockClear());

  test('position refused: « here » and « + » greyed; a touch asks again', async () => {
    const retry = jest.fn();
    await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 360, height: 800 },
          insets: { top: 0, right: 0, bottom: 0, left: 0 },
        }}
      >
        <LocationProvider fixed={{ kind: 'unavailable' }} onRetry={retry}>
          <TripPlanProvider>
            <HomeScreen />
          </TripPlanProvider>
        </LocationProvider>
      </SafeAreaProvider>,
    );

    await fireEvent.press(button('Départ'));
    await sheetPlace('ma position');
    await fireEvent.press(button('Ajouter un lieu'));

    expect(retry).toHaveBeenCalledTimes(2);
    // Nothing chosen: the start still calls.
    expect(button('Départ')).toBeSelected();
    expect(router.push).not.toHaveBeenCalled();
  });

  test('no network: the crossed-out cloud shows at the top', async () => {
    jest.mocked(useNetworkState).mockReturnValue({ isConnected: false });
    await renderHome();

    expect(screen.getByTestId('offline-badge')).toBeOnTheScreen();
    jest.mocked(useNetworkState).mockReturnValue({ isConnected: true, isInternetReachable: true });
  });

  test('online: no cloud', async () => {
    await renderHome();

    expect(screen.queryByTestId('offline-badge')).toBeNull();
  });
});
