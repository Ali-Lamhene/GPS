import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { StreetPhoto } from '@/domain/street-photo';
import {
  clearPhotoCache,
  deletePhoto,
  keepPhoto,
  keepStreetPhoto,
  pickPhoto,
} from '@/services/photo';
import { playCue } from '@/services/feedback';
import { findStreetPhoto } from '@/services/street-photo';
import { HelpButton } from '@/ui/components/help-button';
import { IconButton } from '@/ui/components/icon-button';
import { MapHeader } from '@/ui/components/map-header';
import { StreetPhotoView } from '@/ui/components/street-photo-view';
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
 * Spec 033: a Panoramax street photo of the place, when one faces it, is offered as a
 * thumbnail above the picker; a wheel turns while it is looked for. A first touch shows it in
 * the frame and the shutter becomes « keep »; a second touch on the thumbnail closes it.
 */
export function PhotoScreen() {
  const insets = useSafeAreaInsets();
  const { draft, finish, busy } = usePlaceDraft();
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [working, setWorking] = useState(false);
  const search = useRef<AbortController | null>(null);
  const point = draft?.point;
  // Looked for once per visit, hidden places included (spec 033, user's choice).
  const [street, setStreet] = useState<StreetPhoto | 'searching' | undefined>(
    point ? 'searching' : undefined,
  );
  const [previewing, setPreviewing] = useState(false);
  useDarkSystemBars(PHOTO_BACKGROUND);

  // Copies left by an earlier visit (app closed halfway) may hold a photo with its position.
  useEffect(() => {
    clearPhotoCache();
    return clearPhotoCache;
  }, []);

  // Leaving E29, or taking a photo meanwhile, abandons the search.
  const lng = point?.[0];
  const lat = point?.[1];
  useEffect(() => {
    if (lng === undefined || lat === undefined) return;
    const controller = new AbortController();
    search.current = controller;
    findStreetPhoto([lng, lat], controller.signal).then((found) => {
      if (controller.signal.aborted) return;
      setStreet(found);
      // Seen and heard: a soft note when the thumbnail comes.
      if (found) playCue('select');
    });
    return () => controller.abort();
  }, [lng, lat]);

  // The camera window opens with the screen, once (Android's text, read by the companion).
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) void requestPermission();
  }, [permission, requestPermission]);

  const cameraOn = permission?.granted === true;
  const locked = busy || working;

  const finishWith = async (source: () => Promise<string | undefined>) => {
    if (locked) return;
    setWorking(true);
    // A photo taken or picked meanwhile: the search stops, nothing more is asked.
    if (street === 'searching') {
      search.current?.abort();
      setStreet(undefined);
    }
    const kept = await source();
    setWorking(false);
    setPreviewing(false);
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

  const keepTaken = (picture: string | undefined) =>
    picture ? keepPhoto(picture) : Promise.resolve(undefined);

  const found = street && street !== 'searching' ? street : undefined;
  const shown = previewing ? found : undefined;

  return (
    <View style={styles.screen}>
      {cameraOn && <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" />}
      {shown && (
        <View testID="street-photo-preview" style={[styles.frame, styles.preview]}>
          <StreetPhotoView photo={shown} />
        </View>
      )}
      <View style={styles.frame} pointerEvents="none" />
      <MapHeader
        left={
          <IconButton
            icon="arrow_back"
            label="Retour"
            onPress={() => (previewing ? setPreviewing(false) : router.back())}
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
        {shown ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Garder la photo de rue"
            accessibilityState={{ disabled: locked }}
            disabled={locked}
            onPress={() => finishWith(() => keepStreetPhoto(shown))}
            style={[styles.shutter, styles.keep, locked && styles.busy]}
          >
            {working ? (
              <ActivityIndicator color={colors.white} size="large" />
            ) : (
              <Icon name="check" size={48} color={colors.white} />
            )}
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Prendre la photo"
            accessibilityState={{ disabled: !cameraOn || locked }}
            disabled={!cameraOn || locked}
            onPress={() => finishWith(async () => keepTaken(await takePicture()))}
            style={[styles.shutter, (!cameraOn || locked) && styles.busy]}
          >
            <View style={styles.shutterDisc} />
          </Pressable>
        )}
        <View>
          {/* Above the picker, out of the row: nothing moves when it comes or goes. */}
          {street === 'searching' && (
            <View testID="street-photo-searching" style={[styles.above, styles.searching]}>
              <ActivityIndicator color={colors.white} />
            </View>
          )}
          {found && (
            <Animated.View entering={FadeIn.duration(400)} style={styles.above}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Photo de rue du lieu"
                accessibilityState={{ selected: previewing, disabled: locked }}
                disabled={locked}
                onPress={() => setPreviewing((open) => !open)}
                style={[styles.thumbnail, previewing && styles.thumbnailOpen]}
              >
                <View style={styles.thumbnailPhoto}>
                  <StreetPhotoView photo={found} />
                </View>
                <View style={styles.thumbnailBadge}>
                  <Icon name="landscape" size={16} color={colors.white} />
                </View>
              </Pressable>
            </Animated.View>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choisir une photo"
            disabled={locked}
            onPress={() => finishWith(async () => keepTaken(await pickPhoto()))}
            style={[styles.side, locked && styles.busy]}
          >
            <Icon name="photo_library" size={28} color={colors.emerald} variant="outlined" />
          </Pressable>
        </View>
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
  // Spec 033: above the picker, 20 dp apart, the same width; out of the row's layout.
  above: {
    position: 'absolute',
    bottom: 64 + 20,
    left: -2,
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Searching: no fill, so it never reads as a button.
  searching: {
    borderRadius: 34,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,.6)',
  },
  // A round street photo ringed in emerald, a white edge for sunlight, a landscape badge.
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: colors.white,
  },
  thumbnailOpen: {
    transform: [{ scale: 1.1 }],
  },
  thumbnailPhoto: {
    flex: 1,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: colors.emerald,
    overflow: 'hidden',
    backgroundColor: colors.warmWhite,
  },
  thumbnailBadge: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.emerald,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    overflow: 'hidden',
    backgroundColor: PHOTO_BACKGROUND,
  },
  keep: {
    backgroundColor: colors.emerald,
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
