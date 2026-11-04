import { render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/ui/theme';

import { SystemBarsFrame, useDarkSystemBars } from '../system-bars-frame';

jest.mock('expo-router', () => ({
  // The screen in front: its focus effect runs once mounted.
  useFocusEffect: (effect: () => void) => jest.requireActual('react').useEffect(effect, [effect]),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 800 },
  insets: { top: 32, right: 0, bottom: 48, left: 0 },
};

function Insets() {
  const insets = useSafeAreaInsets();
  return <Text testID="insets">{`${insets.top},${insets.bottom}`}</Text>;
}

function DarkScreen() {
  useDarkSystemBars('#121311');
  return null;
}

function renderFrame(children: ReactNode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <SystemBarsFrame>{children}</SystemBarsFrame>
    </SafeAreaProvider>,
  );
}

describe('<SystemBarsFrame /> (spec 014)', () => {
  test('stops the app at both system bars, on warm-white bands', async () => {
    await renderFrame(<Insets />);

    expect(screen.getByTestId('system-bars-frame')).toHaveStyle({
      paddingTop: 32,
      paddingBottom: 48,
      backgroundColor: colors.warmWhite,
    });
  });

  test('screens inside see no top or bottom inset any more', async () => {
    await renderFrame(<Insets />);

    expect(screen.getByTestId('insets')).toHaveTextContent('0,0');
  });

  test('a dark screen in front darkens the bands, and gives them back when it leaves', async () => {
    const { rerender } = await renderFrame(<DarkScreen />);
    expect(screen.getByTestId('system-bars-frame')).toHaveStyle({ backgroundColor: '#121311' });

    await rerender(
      <SafeAreaProvider initialMetrics={metrics}>
        <SystemBarsFrame>{null}</SystemBarsFrame>
      </SafeAreaProvider>,
    );
    expect(screen.getByTestId('system-bars-frame')).toHaveStyle({
      backgroundColor: colors.warmWhite,
    });
  });
});
