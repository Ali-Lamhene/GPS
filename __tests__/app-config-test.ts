import type { ExpoConfig } from 'expo/config';

import appConfig from '../app.config';
import appJson from '../app.json';

// Native settings required by the security reviews (docs/engineering/securite.md, D1).

const base = appJson.expo as unknown as ExpoConfig;

function resolve(variant?: string): ExpoConfig {
  const previous = process.env.APP_VARIANT;
  if (variant === undefined) delete process.env.APP_VARIANT;
  else process.env.APP_VARIANT = variant;
  try {
    return appConfig({
      config: base,
      projectRoot: '',
      staticConfigPath: null,
      packageJsonPath: null,
    });
  } finally {
    if (previous === undefined) delete process.env.APP_VARIANT;
    else process.env.APP_VARIANT = previous;
  }
}

function pluginOptions(config: ExpoConfig, name: string): unknown {
  const entry = config.plugins?.find(
    (plugin) => (Array.isArray(plugin) ? plugin[0] : plugin) === name,
  );
  return Array.isArray(entry) ? entry[1] : undefined;
}

describe('app config', () => {
  test('keeps app data out of Android backups', () => {
    expect(resolve().android?.allowBackup).toBe(false);
  });

  test('locates in the foreground only, never in the background (spec 017)', () => {
    const blocked = resolve().android?.blockedPermissions ?? [];
    expect(blocked).toEqual(
      expect.arrayContaining([
        'android.permission.ACCESS_BACKGROUND_LOCATION',
        'android.permission.ACCESS_WIFI_STATE',
        'android.permission.FOREGROUND_SERVICE_LOCATION',
        'android.permission.ACTIVITY_RECOGNITION',
        'android.permission.RECORD_AUDIO',
      ]),
    );
    expect(blocked).not.toContain('android.permission.ACCESS_FINE_LOCATION');
    expect(pluginOptions(resolve(), 'expo-location')).toMatchObject({
      isAndroidBackgroundLocationEnabled: false,
      isAndroidForegroundServiceEnabled: false,
      isIosBackgroundLocationEnabled: false,
    });
  });

  test('the location engine of MapLibre stays the one of Android, not Google Play', () => {
    expect(pluginOptions(resolve(), '@maplibre/maplibre-react-native')).toEqual({
      android: { locationEngine: 'default' },
    });
  });

  test('adds no extra link scheme for the development client', () => {
    expect(pluginOptions(resolve(), 'expo-dev-client')).toEqual({ addGeneratedScheme: false });
  });

  test('gives the development build its own package, apart from the published app', () => {
    expect(resolve().android?.package).toBe('org.gpssanstexte.app');
    expect(resolve('development').android?.package).toBe('org.gpssanstexte.app.dev');
    expect(resolve('development').scheme).toBe('gps-dev');
  });
});
