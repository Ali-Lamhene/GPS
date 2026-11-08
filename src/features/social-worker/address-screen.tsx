import { router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AddressResult } from '@/domain/address';
import {
  positionPoint,
  useTravellerPosition,
} from '@/features/traveller/location/location-context';
import { useTripPlan } from '@/features/traveller/trip-plan/trip-plan-context';
import { openCreditPage } from '@/services/credits';
import { IconButton } from '@/ui/components/icon-button';
import { Icon } from '@/ui/icon/icon';
import { colors, fontFamilies, radii } from '@/ui/theme';

import { type AddressSearchState, useAddressSearch } from './use-address-search';

/**
 * E30, companion area (text allowed, D8): find the address of a place (Photon, spec 001),
 * then keep it on this phone (the traveller's) or send it by link (the companion's own
 * phone, spec 019). The pictogram comes next (E28), then the photo or the share sheet.
 */
export function AddressScreen() {
  const insets = useSafeAreaInsets();
  const { dispatch } = useTripPlan();
  const { position } = useTravellerPosition();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<AddressResult | null>(null);
  const search = useAddressSearch(query, positionPoint(position));

  const close = () => {
    dispatch({ type: 'cancelPlace' });
    router.dismissTo('/');
  };
  const go = (send: boolean) => {
    if (!picked) return;
    dispatch({
      type: 'setDraftAddress',
      helpName: picked.name,
      address: picked.detail || undefined,
      point: picked.point,
      send,
    });
    router.push('/add-place/pictogram');
  };

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}
    >
      <View style={styles.header}>
        <IconButton icon="close" label="Fermer" onPress={close} />
        <Text style={styles.title}>Ajouter un lieu</Text>
        <View style={styles.spacer} />
        <Pressable accessibilityRole="button" onPress={() => router.push('/places')}>
          <Text style={styles.link}>Lieux enregistrés</Text>
        </Pressable>
      </View>
      <View style={styles.chip}>
        <Icon name="keyboard" size={18} color={colors.onSecondaryContainer} variant="outlined" />
        <Text style={styles.chipText}>Espace accompagnant</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label} nativeID="address-label">
          Adresse ou nom du lieu
        </Text>
        <TextInput
          accessibilityLabelledBy="address-label"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setPicked(null);
          }}
          placeholder="Ex. 14 quai du Port, Marseille"
          placeholderTextColor={colors.outline}
          autoCorrect={false}
          // The keyboard must not learn the address, nor sync it to its cloud (spec 019).
          autoComplete="off"
          importantForAutofill="no"
          spellCheck={false}
          textContentType="none"
          style={styles.input}
        />
      </View>
      {picked ? (
        <View style={styles.choice}>
          <View style={styles.suggestion}>
            <Icon name="location_on" size={24} color={colors.emerald} variant="outlined" />
            <View style={styles.suggestionText}>
              <Text style={styles.name}>{picked.name}</Text>
              <Text style={styles.address}>{picked.detail}</Text>
            </View>
          </View>
          <Pressable accessibilityRole="button" onPress={() => go(false)} style={styles.primary}>
            <Text style={styles.primaryText}>Garder sur ce téléphone</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => go(true)} style={styles.secondary}>
            <Text style={styles.secondaryText}>Envoyer par lien au voyageur</Text>
          </Pressable>
        </View>
      ) : (
        <SearchList
          search={search}
          onPick={(result) => {
            // The keyboard hid « send by link », below « keep » (field feedback, 2026-11-05).
            Keyboard.dismiss();
            setPicked(result);
          }}
        />
      )}
      <View style={styles.spacer} />
      <Text style={styles.note}>
        La recherche passe par Photon (OpenStreetMap), qui reçoit le texte tapé, la position
        approximative du téléphone et son adresse IP. Le lien contient le lieu exact : préférez une
        messagerie chiffrée (Signal, WhatsApp) au SMS.
      </Text>
      {/* Spec 024: Transitous asks for a visible link to its sources; OpenStreetMap, its credit. */}
      <Text style={styles.note}>
        Crédits : itinéraires par Transitous (
        <Text
          accessibilityRole="link"
          style={styles.noteLink}
          onPress={() => openCreditPage('routingSources')}
        >
          sources des données
        </Text>
        ) · carte et adresses ©{' '}
        <Text
          accessibilityRole="link"
          style={styles.noteLink}
          onPress={() => openCreditPage('openStreetMap')}
        >
          les contributeurs d’OpenStreetMap
        </Text>
      </Text>
    </View>
  );
}

function SearchList({
  search,
  onPick,
}: {
  search: AddressSearchState;
  onPick: (result: AddressResult) => void;
}) {
  switch (search.kind) {
    case 'idle':
      return null;
    case 'searching':
      return <Text style={styles.message}>Recherche…</Text>;
    case 'none':
      return <Text style={styles.message}>Aucune adresse trouvée. Essayez autrement.</Text>;
    case 'offline':
      return (
        <Text style={styles.message}>
          Pas de connexion : la recherche d’adresse a besoin d’internet. Réessayez.
        </Text>
      );
    case 'results':
      return (
        <View style={styles.list}>
          {search.results.map((item, i) => (
            <Pressable
              key={`${item.name}-${item.point[0]}-${item.point[1]}`}
              accessibilityRole="button"
              onPress={() => onPick(item)}
              style={[styles.suggestion, i > 0 && styles.divider]}
            >
              <Icon name="location_on" size={24} color={colors.emerald} variant="outlined" />
              <View style={styles.suggestionText}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.address}>{item.detail}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      );
    default: {
      const unknown: never = search;
      return unknown;
    }
  }
}

const styles = StyleSheet.create({
  choice: {
    gap: 12,
  },
  primary: {
    height: 56,
    borderRadius: radii.control,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: 17,
    fontFamily: fontFamilies.semiBold,
    color: colors.white,
  },
  secondary: {
    height: 56,
    borderRadius: radii.control,
    borderWidth: 2,
    borderColor: colors.emerald,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 17,
    fontFamily: fontFamilies.semiBold,
    color: colors.emerald,
  },
  message: {
    fontSize: 15,
    fontFamily: fontFamilies.regular,
    color: colors.inkMuted,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 16,
    // Pale emerald, like the help screen: a screen apart from the map (spec 010).
    backgroundColor: colors.surfaceLow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  link: {
    fontSize: 15,
    fontFamily: fontFamilies.semiBold,
    color: colors.emerald,
    textDecorationLine: 'underline',
  },
  title: {
    fontSize: 22,
    fontFamily: fontFamilies.semiBold,
    color: colors.emerald,
  },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radii.control,
    backgroundColor: colors.secondaryContainer,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fontFamilies.semiBold,
    color: colors.onSecondaryContainer,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: fontFamilies.semiBold,
    color: colors.inkMuted,
  },
  input: {
    height: 56,
    borderRadius: radii.control,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: 16,
    fontSize: 17,
    fontFamily: fontFamilies.regular,
    backgroundColor: colors.white,
    color: colors.ink,
  },
  list: {
    backgroundColor: colors.warmWhite,
    borderRadius: radii.control,
    overflow: 'hidden',
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLow,
  },
  suggestionText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontFamily: fontFamilies.semiBold,
    color: colors.ink,
  },
  address: {
    fontSize: 13,
    fontFamily: fontFamilies.regular,
    color: colors.inkMuted,
  },
  spacer: {
    flex: 1,
  },
  note: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamilies.regular,
    color: colors.inkMuted,
  },
  noteLink: {
    color: colors.emerald,
    fontFamily: fontFamilies.semiBold,
    textDecorationLine: 'underline',
  },
});
