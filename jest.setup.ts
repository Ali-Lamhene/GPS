// Native audio and speech modules have no Jest implementation: replace them with silent
// fakes so screens that play cues or read names can render in tests.
jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({ seekTo: jest.fn(() => Promise.resolve()), play: jest.fn() })),
}));

jest.mock('expo-speech', () => ({
  stop: jest.fn(() => Promise.resolve()),
  speak: jest.fn(),
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])),
}));

// MapLibre Native has no Jest implementation: an empty map, so screens are tested as they
// were before it. src/ui/map/__tests__/trip-map-test.tsx draws the markers.
jest.mock('@maplibre/maplibre-react-native', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  const container = (name: string) => {
    const Component = ({ children }: { children?: React.ReactNode }) =>
      React.createElement(View, { testID: name }, children);
    Component.displayName = name;
    return Component;
  };
  const Camera = React.forwardRef((_props: object, ref: React.Ref<unknown>) => {
    React.useImperativeHandle(ref, () => ({ easeTo: jest.fn(), fitBounds: jest.fn() }));
    return null;
  });
  Camera.displayName = 'Camera';
  return {
    Map: container('MapLibreMap'),
    Camera,
    GeoJSONSource: container('GeoJSONSource'),
    Layer: () => null,
    Marker: () => null,
    NetworkManager: { setConnected: jest.fn() },
    LogManager: { setLogLevel: jest.fn(), onLog: jest.fn() },
    TransformRequestManager: { addUrlTransform: jest.fn(), addHeader: jest.fn() },
    OfflineManager: { clearAmbientCache: jest.fn(() => Promise.resolve()) },
  };
});

// Network and location have no Jest implementation (spec 017): online by default; the
// position comes from the fixed LocationProvider of the tests.
jest.mock('expo-network', () => ({
  useNetworkState: jest.fn(() => ({ isConnected: true, isInternetReachable: true })),
}));

jest.mock('expo-location', () => ({
  Accuracy: { High: 4 },
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: false, canAskAgain: true, status: 'undetermined' }),
  ),
  getForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: false, canAskAgain: true, status: 'undetermined' }),
  ),
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
}));

// Android's navigation bar: nothing to draw in tests (spec 018).
jest.mock('expo-navigation-bar', () => ({ NavigationBar: () => null }));

// Camera, picker and image re-encoding have no Jest implementation (spec 020).
jest.mock('expo-camera', () => ({
  CameraView: () => null,
  useCameraPermissions: () => [{ granted: true, canAskAgain: true }, jest.fn()],
}));
jest.mock('@/services/photo', () => ({
  PHOTO_NAMES: { toName: () => undefined, toUri: () => undefined },
  pickPhoto: jest.fn(() => Promise.resolve(undefined)),
  keepPhoto: jest.fn(() => Promise.resolve(undefined)),
  deletePhoto: jest.fn(),
  deleteOrphanPhotos: jest.fn(),
  clearPhotoCache: jest.fn(),
}));
