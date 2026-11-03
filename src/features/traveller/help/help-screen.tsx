import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { HelpRequest } from '@/domain/help-message';
import { CURRENT_POSITION, isLocalPicture } from '@/domain/place';
import { speak } from '@/services/speech';
import { IconButton } from '@/ui/components/icon-button';
import { Icon } from '@/ui/icon/icon';
import { MAP_RENDERS } from '@/ui/map/trip-map';
import { colors, radii, shadows, sizes } from '@/ui/theme';

import { LineBadge } from '../components/line-badge';
import { DEMO_GUIDANCE } from '../demo/guidance';
import { DEMO_LEGS } from '../demo/trips';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import { helpCard } from './help-card';
import { HelpMessage } from './help-message';
import { HelpSituationMap } from './help-situation-map';

/**
 * E24: a message in French adapted to the current step, to show a passer-by or have read
 * aloud (D10), above a small map of the situation. Enlarged, the text takes the room.
 */
export function HelpScreen() {
  const insets = useSafeAreaInsets();
  const { mode, origin, destination, guidanceStep } = useTripPlan();
  const [large, setLarge] = useState(false);

  const step = guidanceStep === undefined ? undefined : DEMO_GUIDANCE[mode][guidanceStep];
  // Before leaving, the first thing to find: the stop to take, or the place when walking.
  const firstHelp = destination ? DEMO_GUIDANCE[mode][0]?.help : undefined;
  const request: HelpRequest = step?.help ?? firstHelp ?? { kind: 'findPlace' };
  const card = helpCard(request, destination);
  // Before leaving, the passer-by sees neither the photo of the arrival nor a start that
  // is not where the traveller stands (D13).
  const photo = step && card.photo && isLocalPicture(card.photo) ? card.photo : undefined;
  const showMap = MAP_RENDERS && (step !== undefined || origin?.id === CURRENT_POSITION.id);

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28 }]}
    >
      <View style={styles.header}>
        <IconButton icon="close" label="Fermer" tone="raised" onPress={() => router.back()} />
        <View style={styles.spacer} />
        {card.icons.map((icon) => (
          <View key={icon} style={styles.context}>
            <Icon name={icon} size={26} color={colors.emerald} variant="outlined" />
          </View>
        ))}
        {card.line && <LineBadge line={card.line} size="lg" />}
      </View>
      {/* Scrolls on small screens, so the listen button always stays in view. */}
      <ScrollView style={styles.spacer} contentContainerStyle={styles.content}>
        {photo && !large && (
          <Image source={{ uri: photo }} contentFit="cover" style={styles.photo} />
        )}
        <HelpMessage message={card.message} large={large} />
        {!large && !photo && showMap && (
          <HelpSituationMap legs={DEMO_LEGS[mode]} step={step} destination={destination} />
        )}
      </ScrollView>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lire à voix haute"
          onPress={() => void speak(card.message)}
          style={styles.speak}
        >
          <Icon name="volume_up" size={30} color={colors.onPrimary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={large ? 'Réduire' : 'Agrandir'}
          onPress={() => setLarge(!large)}
          style={styles.enlarge}
        >
          {/* Never a « + »: on the home it means « add a place » (spec 010). */}
          <Icon
            name={large ? 'close_fullscreen' : 'open_in_full'}
            size={26}
            color={colors.emerald}
            variant="outlined"
          />
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
    // Pale emerald: the help screen is set apart from the map screens (spec 010).
    backgroundColor: colors.surfaceLow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spacer: {
    flex: 1,
  },
  content: {
    gap: 16,
  },
  // Context marks, not buttons: no disc, no shadow.
  context: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: radii.placeCard,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  speak: {
    flex: 1,
    height: sizes.actionPill,
    borderRadius: sizes.actionPill / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.accent,
  },
  enlarge: {
    width: sizes.actionPill,
    height: sizes.actionPill,
    borderRadius: sizes.actionPill / 2,
    backgroundColor: colors.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.warm,
  },
});
