import {
  LogManager,
  OfflineManager,
  TransformRequestManager,
} from '@maplibre/maplibre-react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { TripMap } from '../trip-map';

// The phone's map, with MapLibre Native replaced by views that draw their children.
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
  // Like the native marker: the marker itself takes the press, not its content.
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

const camera = { center: [5.37, 43.29] as const, zoom: 15 };

describe('<TripMap /> on the phone', () => {
  test('reaches only the tiles host, without naming the app, and wipes old tiles (spec 017)', () => {
    const transform = jest.mocked(TransformRequestManager.addUrlTransform).mock.calls[0]?.[0];
    expect(transform).toBeDefined();
    const match = new RegExp(String(transform?.match));
    expect(match.test('https://tiles.openfreemap.org/planet/latest')).toBe(false);
    expect(match.test('https://evil.example/tiles/1/2/3.pbf')).toBe(true);
    expect(match.test('http://tiles.openfreemap.org/planet/latest')).toBe(true);
    expect(TransformRequestManager.addHeader).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'User-Agent', value: 'MapLibre Native' }),
    );
    expect(OfflineManager.clearAmbientCache).toHaveBeenCalled();
  });

  test('keeps the map logs out of the console before any map', () => {
    expect(LogManager.setLogLevel).toHaveBeenCalledWith('error');
    expect(LogManager.onLog).toHaveBeenCalled();
  });

  test('a touched pin gives its place', async () => {
    const onPinPress = jest.fn();
    await render(
      <TripMap
        camera={camera}
        pins={[{ id: 'work', point: [5.38, 43.3], icon: 'work', label: 'mon lieu de travail' }]}
        onPinPress={onPinPress}
      />,
    );

    await fireEvent.press(await screen.findByRole('button', { name: 'mon lieu de travail' }));

    expect(onPinPress).toHaveBeenCalledWith('work');
  });

  test('a screen reader activating a pin gives its place', async () => {
    const onPinPress = jest.fn();
    await render(
      <TripMap
        camera={camera}
        pins={[{ id: 'work', point: [5.38, 43.3], icon: 'work', label: 'mon lieu de travail' }]}
        onPinPress={onPinPress}
      />,
    );

    const pin = await screen.findByRole('button', { name: 'mon lieu de travail' });
    await fireEvent(pin, 'accessibilityAction', { nativeEvent: { actionName: 'activate' } });

    expect(onPinPress).toHaveBeenCalledWith('work');
  });

  test('the map credit stays folded behind ⓘ until touched (D9)', async () => {
    await render(<TripMap camera={camera} />);
    const credit = await screen.findByRole('button', { name: 'Crédit de la carte' });
    expect(screen.queryByText(/OpenStreetMap/)).toBeNull();

    await fireEvent.press(credit);

    expect(
      screen.getByText('© OpenFreeMap © OpenMapTiles © OpenStreetMap · Trajets : Transitous'),
    ).toBeOnTheScreen();
  });
});
