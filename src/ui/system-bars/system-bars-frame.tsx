import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/ui/theme';

/** Colour of the bands behind the system bars, and whether their icons are dark or light. */
export type SystemBarsLook = { band: string; icons: 'dark' | 'light' };

const LIGHT: SystemBarsLook = { band: colors.warmWhite, icons: 'dark' };

const SetLookContext = createContext<(look: SystemBarsLook) => void>(() => undefined);

/**
 * Frame of the whole app (spec 014). Android draws apps edge to edge, under its status and
 * navigation bars: this frame stops the app at both bars, paints a band behind each, and
 * keeps the status icons readable. Screens inside see no top or bottom inset any more.
 */
export function SystemBarsFrame({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [look, setLook] = useState<SystemBarsLook>(LIGHT);
  const inner = useMemo(() => ({ ...insets, top: 0, bottom: 0 }), [insets]);

  return (
    <View
      testID="system-bars-frame"
      style={[
        styles.frame,
        { backgroundColor: look.band, paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar style={look.icons} />
      <SetLookContext.Provider value={setLook}>
        <SafeAreaInsetsContext.Provider value={inner}>{children}</SafeAreaInsetsContext.Provider>
      </SetLookContext.Provider>
    </View>
  );
}

/**
 * A dark screen (E21, E29) darkens the bands while it is the screen in front, then gives
 * them back to warm white.
 */
export function useDarkSystemBars(band: string) {
  const setLook = useContext(SetLookContext);
  useFocusEffect(
    useCallback(() => {
      setLook({ band, icons: 'light' });
      // Back to warm white only if no other dark screen took the bands meanwhile.
      return () => setLook((current) => (current.band === band ? LIGHT : current));
    }, [band, setLook]),
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
  },
});
