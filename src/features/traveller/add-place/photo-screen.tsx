import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HelpButton } from '@/ui/components/help-button';
import { IconButton } from '@/ui/components/icon-button';
import { MapHeader } from '@/ui/components/map-header';
import { useDarkSystemBars } from '@/ui/system-bars/system-bars-frame';
import { Icon } from '@/ui/icon/icon';
import { colors, radii } from '@/ui/theme';

import { usePlaceDraft } from './use-place-draft';

// In this static version (D11) the viewfinder stays dark and "taking" a photo saves the
// place without one. The real camera and gallery come with spec 001.

/** E29: optional photo of the new place, to recognise it later. */
/** Dark camera backdrop of E29, also behind the system bars (spec 014). */
const PHOTO_BACKGROUND = '#1B1C1A';

export function PhotoScreen() {
  const insets = useSafeAreaInsets();
  const { finish, busy } = usePlaceDraft();
  useDarkSystemBars(PHOTO_BACKGROUND);

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
          disabled={busy}
          onPress={() => finish()}
          style={[styles.side, busy && styles.busy]}
        >
          <Icon name="no_photography" size={28} color={colors.emerald} variant="outlined" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Prendre la photo"
          disabled={busy}
          onPress={() => finish()}
          style={[styles.shutter, busy && styles.busy]}
        >
          <View style={styles.shutterDisc} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choisir une photo"
          disabled={busy}
          onPress={() => finish()}
          style={[styles.side, busy && styles.busy]}
        >
          <Icon name="photo_library" size={28} color={colors.emerald} variant="outlined" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Saving: the buttons dim at once, a second touch does nothing (spec 015).
  busy: {
    opacity: 0.5,
  },
  screen: {
    flex: 1,
    backgroundColor: PHOTO_BACKGROUND,
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
