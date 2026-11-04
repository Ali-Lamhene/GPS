import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';

import { playCue } from '@/services/feedback';
import { Icon } from '@/ui/icon/icon';
import { colors, shadows } from '@/ui/theme';

/** How long the red cross stays on the home before it goes. */
const SHOWN_MS = 1800;
const DISC_SIZE = 96;

type SaveFailedSignalProps = {
  /** Called once the signal has been shown. */
  onDone: () => void;
};

/**
 * A new place could not be saved (spec 015): once the home is in front, a red cross pops in
 * its middle with the alert sound and vibration, all together, then fades. The place is not
 * kept.
 */
export function SaveFailedSignal({ onDone }: SaveFailedSignalProps) {
  const [shown, setShown] = useState(false);
  // The latest callback, so a new render of the home does not restart the timer.
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useFocusEffect(
    useCallback(() => {
      setShown(true);
      playCue('alert');
      const timer = setTimeout(() => done.current(), SHOWN_MS);
      return () => clearTimeout(timer);
    }, []),
  );

  if (!shown) return null;
  return (
    <View pointerEvents="none" style={styles.center}>
      <Animated.View
        testID="save-failed"
        entering={ZoomIn.springify().damping(12)}
        exiting={FadeOut}
        style={styles.disc}
      >
        <Icon name="close" size={56} color={colors.white} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    width: DISC_SIZE,
    height: DISC_SIZE,
    borderRadius: DISC_SIZE / 2,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.sheet,
  },
});
