import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { clearPhotoCache, deletePhoto, keepPhoto, pickPhoto } from '@/services/photo';
import { HelpButton } from '@/ui/components/help-button';
import { IconButton } from '@/ui/components/icon-button';
import { MapHeader } from '@/ui/components/map-header';
import { useDarkSystemBars } from '@/ui/system-bars/system-bars-frame';
import { Icon } from '@/ui/icon/icon';
import { colors, radii } from '@/ui/theme';

import { usePlaceDraft } from './use-place-draft';

/** Dark camera backdrop of E29, also behind the system bars (spec 014). */
const PHOTO_BACKGROUND = '#1B1C1A';

/**
 * E29 (spec 020): the optional photo of the new place, to recognise it later. The camera of
 * the app itself, so the photo never lands in the phone's gallery; or the system photo
 * picker; or no photo. The photo is re-encoded without its metadata and kept with the place.
 * Camera refused: the shutter greys out, the picker and « no photo » still work.
 */
export function PhotoScreen() {
  const insets = useSafeAreaInsets();
  const { finish, busy } = usePlaceDraft();
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [working, setWorking] = useState(false);
  useDarkSystemBars(PHOTO_BACKGROUND);

  // Copies left by an earlier visit (app closed halfway) may hold a photo with its position.
  useEffect(() => {
    clearPhotoCache();
    return clearPhotoCache;
  }, []);

  // The camera window opens with the screen, once (Android's text, read by the companion).
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) void requestPermission();
  }, [permission, requestPermission]);

  const cameraOn = permission?.granted === true;
  const locked = busy || working;

  const finishWith = async (source: Promise<string | undefined>) => {
    if (locked) return;
    setWorking(true);
    const picture = await source;
    const kept = picture ? await keepPhoto(picture) : undefined;
    setWorking(false);
    // Nothing taken or chosen: stay, the traveller can try again or go without.
    if (!kept) return;
    // A photo of no place is never left behind (spec 020).
    if (!(await finish(kept))) deletePhoto(kept);
  };

  const takePicture = async () => {
    try {
      const picture = await camera.current?.takePictureAsync({ quality: 1, exif: false });
      return picture?.uri;
    } catch {
      return undefined;
    }
  };

  return (
    <View style={styles.screen}>
      {cameraOn && <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" />}
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
          disabled={locked}
          onPress={() => finish()}
          style={[styles.side, locked && styles.busy]}
        >
          <Icon name="no_photography" size={28} color={colors.emerald} variant="outlined" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Prendre la photo"
          accessibilityState={{ disabled: !cameraOn || locked }}
          disabled={!cameraOn || locked}
          onPress={() => finishWith(takePicture())}
          style={[styles.shutter, (!cameraOn || locked) && styles.busy]}
        >
          <View style={styles.shutterDisc} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choisir une photo"
          disabled={locked}
          onPress={() => finishWith(pickPhoto())}
          style={[styles.side, locked && styles.busy]}
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
