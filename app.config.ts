import type { ConfigContext, ExpoConfig } from 'expo/config';

// The development build gets its own Android package, so it never shares a signature or
// stored places with the published app (security review of the native map, 2026-11-03).
// EAS sets APP_VARIANT in eas.json; nothing else reads it.
const DEV_SUFFIX = '.dev';

export default ({ config }: ConfigContext): ExpoConfig => {
  const isDevelopment = process.env.APP_VARIANT === 'development';
  const base = config as ExpoConfig;
  if (!isDevelopment) {
    // Published builds never draw over other apps: Expo declares SYSTEM_ALERT_WINDOW for
    // the dev overlay in the main manifest (security review of the preview profile).
    return {
      ...base,
      android: {
        ...base.android,
        blockedPermissions: [
          ...(base.android?.blockedPermissions ?? []),
          'android.permission.SYSTEM_ALERT_WINDOW',
        ],
      },
    };
  }
  return {
    ...base,
    name: `${base.name} dev`,
    // Only the development build has a link scheme, for the development client and Metro.
    // Published builds have none (D19): Expo Router falls back to « / » without one, and
    // only verified https links open them.
    scheme: 'yalla-dev',
    android: {
      ...base.android,
      package: `${base.android?.package ?? ''}${DEV_SUFFIX}`,
      // Never App Links in the development build: its launcher would load the JavaScript
      // named by a forged https link (spec 018 security review).
      intentFilters: [],
    },
  };
};
