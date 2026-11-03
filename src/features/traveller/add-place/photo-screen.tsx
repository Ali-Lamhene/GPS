import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HelpButton } from '@/ui/components/help-button';
import { IconButton } from '@/ui/components/icon-button';
import { MapHeader } from '@/ui/components/map-header';
import { Icon } from '@/ui/icon/icon';
import { colors, radii } from '@/ui/theme';

import { usePlaceDraft } from './use-place-draft';

// In this static version (D11) the viewfinder stays dark and "taking" a photo saves the
// place without one. The real camera and gallery come with spec 001.

/** E29: optional photo of the new place, to recognise it later. */
export function PhotoScreen() {
  const insets = useSafeAreaInsets();
  const { finish } = usePlaceDraft();

  return (
    <View style={styles.screen}>
      <View style={styles.frame} pointerEvents="none" />
      <MapHeader
        left={
          <IconButton
            icon="arrow_back"
            label="Retour"
            onPress={() => router.back()}
            tone="raised"
          />
        }
        right={<HelpButton onPress={() => router.push('/help')} />}
      />
      <View
        style={[styles.controls, { height: 190 + insets.bottom, paddingBottom: insets.bottom }]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sans photo"
          onPress={() => finish()}
          style={styles.side}
        >
          <Icon name="no_photography" size={28} color={colors.emerald} variant="outlined" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Prendre la photo"
          onPress={() => finish()}
          style={styles.shutter}
        >
          <View style={styles.shutterDisc} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choisir une photo"
          onPress={() => finish()}
          style={styles.side}
        >
          <Icon name="photo_library" size={28} color={colors.emerald} variant="outlined" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1B1C1A',
  },
  frame: {
    position: 'absolute',
    left: 28,
    right: 28,
    top: 110,
    bottom: 220,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,.75)',
    borderRadius: radii.control,
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  side: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterDisc: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.white,
  },
});
