import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HelpButton } from '@/ui/components/help-button';
import { PulseRing } from '@/ui/components/pulse-ring';
import { Icon } from '@/ui/icon/icon';
import { colors } from '@/ui/theme';

import { useCueOnEnter } from '../hooks/use-cue-on-enter';
import { useGoHome } from '../hooks/use-go-home';
import { useTripPlan } from '../trip-plan/trip-plan-context';

const SEAL = 92;

/** E26: arrived. The destination pictogram with a green seal, its own sound and vibration. */
export function ArrivedScreen() {
  const insets = useSafeAreaInsets();
  const { destination } = useTripPlan();
  const goHome = useGoHome();
  useCueOnEnter('arrival');

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 28 }]}
    >
      <View style={styles.header}>
        <HelpButton onPress={() => router.push('/help')} />
      </View>
      <View style={styles.center}>
        <View style={styles.place}>
          <Icon name={destination?.icon ?? 'flag'} size={132} color={colors.white} />
          <View style={styles.sealBox}>
            <PulseRing borderRadius={SEAL / 2} />
            <View style={styles.seal}>
              <Icon name="check" size={56} color={colors.white} variant="outlined" />
            </View>
          </View>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Accueil"
        onPress={goHome}
        style={styles.home}
      >
        <Icon name="home" size={36} variant="outlined" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  place: {
    width: 232,
    height: 232,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealBox: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: SEAL,
    height: SEAL,
  },
  seal: {
    width: SEAL,
    height: SEAL,
    borderRadius: SEAL / 2,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 0 6px ${colors.surface}`,
  },
  home: {
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
