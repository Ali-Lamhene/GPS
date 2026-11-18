import { fireEvent, screen, within } from '@testing-library/react-native';
import { router } from 'expo-router';

import type { Place } from '@/domain/place';
import { playCue } from '@/services/feedback';
import { layout, renderWithProviders } from '@/testing/render-with-providers';

import { useTripPlan } from '../../trip-plan/trip-plan-context';
import { HomeScreen } from '../home-screen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useFocusEffect: (effect: () => void) => jest.requireActual('react').useEffect(effect, [effect]),
}));
jest.mock('@/services/feedback', () => ({ playCue: jest.fn() }));
// The map draws its pins, which take a short press like the native marker. A host view keeps
// any prop: the test reads what the app gives the map.
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
  const Map = ({ children, onLongPress }: { children?: React.ReactNode; onLongPress?: unknown }) =>
    React.createElement(
      View,
      { testID: 'map', onLongPress } as React.ComponentProps<typeof View>,
      children,
    );
  const Marker = ({ children, onPress }: { children?: React.ReactNode; onPress?: () => void }) =>
    React.createElement(Pressable, { onPress, disabled: !onPress }, children);
  return {
    Map,
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

// Far from the demo places: its pin stands alone on the map.
const school: Place = {
  id: 'p-school',
  icon: 'school',
  photo: 'file:///files/photos/school.jpg',
  helpName: 'le lycée',
  point: [5.5, 43.2],
  createdAt: 5,
};

/** What the home leaves in the plan: the draft started, and the ends of the trip. */
let plan: ReturnType<typeof useTripPlan> | undefined;
const keep = (next: ReturnType<typeof useTripPlan>) => {
  plan = next;
};
function Probe({ onPlan = keep }: { onPlan?: typeof keep }) {
  onPlan(useTripPlan());
  return null;
}

async function renderHome() {
  await renderWithProviders(
    <>
      <HomeScreen />
      <Probe />
    </>,
    [{ type: 'addPlace', place: school }],
  );
}

async function openSheet(end: 'Départ' | 'Arrivée') {
  await fireEvent.press(screen.getByRole('button', { name: end }));
  await fireEvent(screen.getByTestId('place-grid'), 'layout', layout(320, 400));
  return within(screen.getByTestId('place-grid'));
}

describe('changing a place from the place sheet (spec 037)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    plan = undefined;
  });

  test('a long press on a place opens its pictogram screen, felt and heard', async () => {
    await renderHome();
    const sheet = await openSheet('Arrivée');

    await fireEvent(sheet.getByRole('button', { name: 'le lycée' }), 'longPress');

    expect(router.push).toHaveBeenCalledWith('/add-place/pictogram');
    expect(playCue).toHaveBeenCalledWith('hold');
    expect(plan?.draft).toMatchObject({ source: 'edit', editing: school, icon: 'school' });
    // The sheet closes behind the new screen; the trip is not touched.
    expect(screen.queryByTestId('place-grid')).toBeNull();
    expect(plan?.destinationId).toBeUndefined();
    expect(playCue).not.toHaveBeenCalledWith('select');
  });

  test('a short touch still chooses the place, without changing it', async () => {
    await renderHome();
    const sheet = await openSheet('Arrivée');

    await fireEvent.press(sheet.getByRole('button', { name: 'le lycée' }));

    expect(plan?.destinationId).toBe(school.id);
    expect(plan?.draft).toBeUndefined();
    expect(router.push).not.toHaveBeenCalled();
  });

  test('works from the start sheet too', async () => {
    await renderHome();
    const sheet = await openSheet('Départ');

    await fireEvent(sheet.getByRole('button', { name: 'le lycée' }), 'longPress');

    expect(router.push).toHaveBeenCalledWith('/add-place/pictogram');
    expect(plan?.originId).toBeUndefined();
  });

  test('both ends chosen: still works, except on the greyed tile of the other end', async () => {
    await renderHome();
    let sheet = await openSheet('Départ');
    await fireEvent.press(sheet.getByRole('button', { name: 'ma position' }));
    sheet = await openSheet('Arrivée');
    await fireEvent.press(sheet.getByRole('button', { name: 'le lycée' }));
    sheet = await openSheet('Départ');

    await fireEvent(sheet.getByRole('button', { name: 'le lycée' }), 'longPress');

    // Greyed in the start sheet (it is the arrival): nothing happens.
    expect(router.push).not.toHaveBeenCalled();

    sheet = await openSheet('Arrivée');
    await fireEvent(sheet.getByRole('button', { name: 'le lycée' }), 'longPress');
    expect(router.push).toHaveBeenCalledWith('/add-place/pictogram');
    expect(plan?.destinationId).toBe(school.id);
  });

  test('« here » cannot be changed', async () => {
    await renderHome();
    const sheet = await openSheet('Départ');

    await fireEvent(sheet.getByRole('button', { name: 'ma position' }), 'longPress');

    expect(router.push).not.toHaveBeenCalled();
    expect(plan?.draft).toBeUndefined();
  });
});

describe('the map pin has no way to change a place (spec 037, D22)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    plan = undefined;
  });

  test('a short touch on the pin still chooses it (spec 035)', async () => {
    await renderHome();

    await fireEvent.press(await screen.findByRole('button', { name: 'le lycée' }));

    expect(plan?.originId).toBe(school.id);
    expect(plan?.draft).toBeUndefined();
    expect(router.push).not.toHaveBeenCalled();
  });

  test('the map hears no long press and the pin offers no long press action', async () => {
    await renderHome();

    expect(screen.getByTestId('map').props.onLongPress).toBeUndefined();
    const pin = await screen.findByRole('button', { name: 'le lycée' });
    expect(pin.props.accessibilityActions).toEqual([{ name: 'activate' }]);
  });
});
