import {
  LogManager,
  OfflineManager,
  TransformRequestManager,
} from '@maplibre/maplibre-react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

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
  // The map hears long presses (patched library, spec 037) and places points on the screen:
  // 10 000 points per degree, from 5.37° E and 43.31° N.
  const Map = React.forwardRef(
    (
      { children, onLongPress }: { children?: React.ReactNode; onLongPress?: unknown },
      ref: React.Ref<unknown>,
    ) => {
      React.useImperativeHandle(ref, () => ({
        project: async ([lng, lat]: [number, number]) => [
          (lng - 5.37) * 10000,
          (43.31 - lat) * 10000,
        ],
      }));
      // A host view keeps any prop: the test fires the map's long press on it.
      const props = { testID: 'map', onLongPress } as React.ComponentProps<typeof View>;
      return React.createElement(View, props, children);
    },
  );
  Map.displayName = 'Map';
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

  describe('a long press on a pin (spec 037)', () => {
    // At 5.38° E, 43.30° N: its point is 100, 100 on the screen of the mocked map.
    const pins = [
      { id: 'work', point: [5.38, 43.3] as const, icon: 'work' as const, label: 'mon travail' },
      { id: 'park', point: [5.385, 43.3] as const, icon: 'park' as const, label: 'le parc' },
    ];
    const longPressAt = (point: [number, number]) =>
      act(async () => {
        fireEvent(screen.getByTestId('map'), 'longPress', { nativeEvent: { point } });
      });

    test('gives the place of the pin under the finger, never a press', async () => {
      const onPinPress = jest.fn();
      const onPinLongPress = jest.fn();
      await render(
        <TripMap
          camera={camera}
          pins={pins}
          onPinPress={onPinPress}
          onPinLongPress={onPinLongPress}
        />,
      );

      await longPressAt([100, 70]);
      await longPressAt([150, 70]);

      expect(onPinLongPress.mock.calls).toEqual([['work'], ['park']]);
      expect(onPinPress).not.toHaveBeenCalled();
    });

    test('a long press on the map away from the pins gives nothing', async () => {
      const onPinLongPress = jest.fn();
      await render(<TripMap camera={camera} pins={pins} onPinLongPress={onPinLongPress} />);

      await longPressAt([300, 300]);

      expect(onPinLongPress).not.toHaveBeenCalled();
    });

    test('a screen reader can long press a pin too', async () => {
      const onPinPress = jest.fn();
      const onPinLongPress = jest.fn();
      await render(
        <TripMap
          camera={camera}
          pins={pins}
          onPinPress={onPinPress}
          onPinLongPress={onPinLongPress}
        />,
      );

      const pin = await screen.findByRole('button', { name: 'le parc' });
      await fireEvent(pin, 'accessibilityAction', { nativeEvent: { actionName: 'longpress' } });

      expect(onPinLongPress).toHaveBeenCalledWith('park');
      expect(onPinPress).not.toHaveBeenCalled();
    });
  });

  test("the traveller's dot is a button only when asked, and gives the touch (spec 035)", async () => {
    const onTravellerPress = jest.fn();
    const { rerender } = await render(
      <TripMap camera={camera} traveller={{ point: [5.37, 43.29] }} />,
    );
    expect(screen.queryByRole('button', { name: 'ma position' })).toBeNull();

    await rerender(
      <TripMap
        camera={camera}
        traveller={{ point: [5.37, 43.29] }}
        onTravellerPress={onTravellerPress}
      />,
    );
    await fireEvent.press(await screen.findByRole('button', { name: 'ma position' }));

    expect(onTravellerPress).toHaveBeenCalledTimes(1);
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

describe('<TripMap /> photos on the pins (spec 036)', () => {
  const at = [5.38, 43.3] as const;

  test('the arrival and start pins show the photo of their place', async () => {
    await render(
      <TripMap
        camera={camera}
        origin={{ point: at, icon: 'home', photo: 'file:///home.jpg' }}
        destination={{ point: at, icon: 'school', photo: 'file:///school.jpg' }}
      />,
    );

    const photos = await screen.findAllByTestId('place-pin-photo');
    expect(photos.map((photo) => photo.props.source.uri)).toEqual([
      'file:///home.jpg',
      'file:///school.jpg',
    ]);
  });

  test('without a photo the pins keep their pictogram', async () => {
    await render(
      <TripMap
        camera={camera}
        origin={{ point: at, icon: 'home' }}
        destination={{ point: at, icon: 'school' }}
      />,
    );

    expect(screen.queryByTestId('place-pin-photo')).toBeNull();
  });

  test('a saved place pin shows its photo on the map', async () => {
    await render(
      <TripMap
        camera={camera}
        pins={[{ id: 'a', point: at, icon: 'home', label: 'mon domicile', photo: 'file:///a.jpg' }]}
      />,
    );

    expect((await screen.findByTestId('place-pin-photo')).props.source.uri).toBe('file:///a.jpg');
  });
});
