import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { HelpRequest } from '@/domain/help-message';
import { speak } from '@/services/speech';
import { IconButton } from '@/ui/components/icon-button';
import { Icon } from '@/ui/icon/icon';
import { colors, radii, shadows } from '@/ui/theme';

import { LineBadge } from '../components/line-badge';
import { DEMO_GUIDANCE } from '../demo/guidance';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import { helpCard } from './help-card';
import { HelpMessage } from './help-message';

/**
 * E24: a message in French adapted to the current step, to show a passer-by or have read
 * aloud (D10). It can be enlarged; the photo then makes room for the text.
 */
export function HelpScreen() {
  const insets = useSafeAreaInsets();
  const { mode, destination, guidanceStep } = useTripPlan();
  const [large, setLarge] = useState(false);

  const request: HelpRequest = (guidanceStep !== undefined &&
    DEMO_GUIDANCE[mode][guidanceStep]?.help) || {
    kind: 'findPlace',
  };
  const card = helpCard(request, destination);

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28 }]}
    >
      <View style={styles.header}>
        <IconButton icon="close" label="Fermer" onPress={() => router.back()} iconSize={32} />
        <View style={styles.spacer} />
        {card.icons.map((icon) => (
          <View key={icon} style={styles.context}>
            <Icon name={icon} size={28} />
          </View>
        ))}
        {card.line && <LineBadge line={card.line} size="lg" />}
      </View>
      {card.photo && !large && (
        <Image source={{ uri: card.photo }} contentFit="cover" style={styles.photo} />
      )}
      <HelpMessage message={card.message} large={large} />
      <View style={styles.spacer} />
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lire à voix haute"
          onPress={() => void speak(card.message)}
          style={styles.speak}
        >
          <Icon name="volume_up" size={40} color={colors.onPrimary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={large ? 'Réduire' : 'Agrandir'}
          onPress={() => setLarge(!large)}
          style={styles.enlarge}
        >
          <Icon name={large ? 'close_fullscreen' : 'open_in_full'} size={34} variant="outlined" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 16,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spacer: {
    flex: 1,
  },
  context: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.tonal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: '100%',
    height: 160,
    borderRadius: radii.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  speak: {
    flex: 1,
    height: 80,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.medium,
  },
  enlarge: {
    width: 80,
    height: 80,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
