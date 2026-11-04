import { router } from 'expo-router';
import { Alert, FlatList, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isCataloguePictogram, pictogramName } from '@/domain/pictograms';
import type { Place } from '@/domain/place';
import { encodeShareLink } from '@/domain/share-link';
import { useTripPlan } from '@/features/traveller/trip-plan/trip-plan-context';
import { useRemovePlace } from '@/features/traveller/trip-plan/use-save-place';
import { PlaceFace } from '@/ui/components/place-face';
import { IconButton } from '@/ui/components/icon-button';
import { colors, fontFamilies, radii } from '@/ui/theme';

const THUMB = 56;

/**
 * Companion area (text allowed, D8; spec 022): the places kept on this phone, newest first.
 * Each can be sent by link (spec 019) or deleted with its photo, after a confirmation.
 */
export function PlacesScreen() {
  const insets = useSafeAreaInsets();
  const { customPlaces } = useTripPlan();
  const removePlace = useRemovePlace();
  const places = [...customPlaces].reverse();

  const share = (place: Place) => {
    if (!place.point || !isCataloguePictogram(place.icon)) return;
    Share.share({ message: encodeShareLink({ point: place.point, icon: place.icon }) }).catch(
      () => undefined,
    );
  };

  const confirmRemove = (place: Place) =>
    Alert.alert('Supprimer ce lieu ?', 'Le lieu et sa photo seront effacés de ce téléphone.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          removePlace(place.id).then((done) => {
            if (!done) Alert.alert('Impossible de supprimer ce lieu', 'Réessayez.');
          });
        },
      },
    ]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 20 }]}>
      <View style={styles.header}>
        <IconButton icon="arrow_back" label="Retour" onPress={() => router.back()} />
        <Text style={styles.title}>Lieux de ce téléphone</Text>
      </View>
      <FlatList
        data={places}
        keyExtractor={(place) => place.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, gap: 12 }}
        ListEmptyComponent={<Text style={styles.empty}>Aucun lieu enregistré.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.thumb}>
              <PlaceFace place={item} iconSize={28} showPhoto />
            </View>
            <Text style={styles.name} numberOfLines={2}>
              {item.helpName ?? pictogramName(item.icon)}
            </Text>
            {item.point && (
              <Pressable
                accessibilityRole="button"
                onPress={() => share(item)}
                style={styles.action}
              >
                <Text style={styles.actionText}>Envoyer</Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={() => confirmRemove(item)}
              style={styles.action}
            >
              <Text style={[styles.actionText, styles.danger]}>Supprimer</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 16,
    backgroundColor: colors.surfaceLow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: fontFamilies.semiBold,
    color: colors.emerald,
  },
  empty: {
    fontSize: 15,
    fontFamily: fontFamilies.regular,
    color: colors.inkMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radii.control,
    backgroundColor: colors.white,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: radii.control,
    overflow: 'hidden',
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamilies.semiBold,
    color: colors.ink,
  },
  action: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 15,
    fontFamily: fontFamilies.semiBold,
    color: colors.emerald,
  },
  danger: {
    color: colors.error,
  },
});
