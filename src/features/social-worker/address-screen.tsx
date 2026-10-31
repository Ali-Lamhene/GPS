import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTripPlan } from '@/features/traveller/trip-plan/trip-plan-context';
import { IconButton } from '@/ui/components/icon-button';
import { Icon } from '@/ui/icon/icon';
import { colors, fontFamilies } from '@/ui/theme';

import { matchAddresses } from './demo/addresses';

/**
 * E30, companion area (text allowed, D8): find the address of a new place. The traveller
 * then picks its pictogram and photo (E28, E29).
 */
export function AddressScreen() {
  const insets = useSafeAreaInsets();
  const { dispatch } = useTripPlan();
  const [query, setQuery] = useState('');
  const suggestions = matchAddresses(query);

  const close = () => {
    dispatch({ type: 'cancelPlace' });
    router.dismissTo('/');
  };
  const pick = (name: string) => {
    dispatch({ type: 'setDraftName', helpName: name });
    router.push('/add-place/pictogram');
  };

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}
    >
      <View style={styles.header}>
        <IconButton icon="close" label="Fermer" onPress={close} />
        <Text style={styles.title}>Ajouter un lieu</Text>
      </View>
      <View style={styles.chip}>
        <Icon
          name="supervisor_account"
          size={18}
          color={colors.onSecondaryContainer}
          variant="outlined"
        />
        <Text style={styles.chipText}>Espace accompagnant</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label} nativeID="address-label">
          Adresse ou nom du lieu
        </Text>
        <TextInput
          accessibilityLabelledBy="address-label"
          value={query}
          onChangeText={setQuery}
          placeholder="Ex. 14 quai du Port"
          placeholderTextColor={colors.outline}
          autoCorrect={false}
          style={styles.input}
        />
      </View>
      <View style={styles.list}>
        {suggestions.map((item, i) => (
          <Pressable
            key={item.name}
            accessibilityRole="button"
            onPress={() => pick(item.name)}
            style={[styles.suggestion, i > 0 && styles.divider]}
          >
            <Icon name="location_on" size={24} color={colors.inkMuted} variant="outlined" />
            <View style={styles.suggestionText}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.address}>{item.address}</Text>
            </View>
          </Pressable>
        ))}
      </View>
      <View style={styles.spacer} />
      <Text style={styles.note}>
        Ensuite : choix du pictogramme, puis photo (facultative). Le voyageur pourra le faire
        lui-même.
      </Text>
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
  title: {
    fontSize: 22,
    fontFamily: fontFamilies.semiBold,
    color: colors.ink,
  },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 8,
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
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: 16,
    fontSize: 17,
    fontFamily: fontFamilies.regular,
    backgroundColor: colors.white,
    color: colors.ink,
  },
  list: {
    backgroundColor: colors.surfaceLow,
    borderRadius: 16,
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
    borderTopColor: colors.surfaceHighest,
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
});
