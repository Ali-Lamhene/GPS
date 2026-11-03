import { LogManager, NetworkManager } from '@maplibre/maplibre-react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { TripMap } from '../trip-map';

// The phone's map, with MapLibre Native replaced by views that draw their children.
jest.mock('@maplibre/maplibre-react-native', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  const container = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(View, null, children);
  const Camera = React.forwardRef((_props: object, ref: React.Ref<unknown>) => {
    React.useImperativeHandle(ref, () => ({ easeTo: jest.fn(), fitBounds: jest.fn() }));
    return null;
  });
  Camera.displayName = 'Camera';
  return {
    Map: container,
    Camera,
    GeoJSONSource: container,
    Layer: () => null,
    Marker: container,
    NetworkManager: { setConnected: jest.fn() },
    LogManager: { setLogLevel: jest.fn(), onLog: jest.fn() },
  };
});

jest.mock('@/services/offline-map', () => ({
  loadLocalTilesUrl: () => Promise.resolve('pmtiles://file:///cache/marseille.pmtiles'),
}));

const camera = { center: [5.37, 43.29] as const, zoom: 15 };

describe('<TripMap /> on the phone', () => {
  test('switches off the map network and its logs before any map', () => {
    expect(NetworkManager.setConnected).toHaveBeenCalledWith(false);
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

  test('the map credit stays folded behind ⓘ until touched (D9)', async () => {
    await render(<TripMap camera={camera} />);
    const credit = await screen.findByRole('button', { name: 'Crédit de la carte' });
    expect(screen.queryByText(/OpenStreetMap/)).toBeNull();

    await fireEvent.press(credit);

    expect(screen.getByText('© OpenStreetMap, Protomaps')).toBeOnTheScreen();
  });
});
