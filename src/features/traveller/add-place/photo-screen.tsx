import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isLocalPicture } from '@/domain/place';
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

/** What the frame shows in place of the camera, with ✓ in place of the shutter. */
type Preview = 'current' | 'street' | 'none';

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
 * Spec 037: a saved place being changed opens on its own photo with « keep »; its thumbnail,
 * above « no photo », opens or closes it; the three choices of the creation stay. Removing
 * its own photo is first shown (the bare pictogram), then ✓.
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
  // Spec 037: a saved place being changed opens on its own photo, kept by ✓.
  const original = draft?.editing?.photo;
  const current = original !== undefined && isLocalPicture(original) ? original : undefined;
  // What the frame shows instead of the camera: the place's own photo, the street photo, or,
  // before its own photo is removed, the place without photo (UX review of spec 037).
  const [preview, setPreview] = useState<Preview | undefined>(current ? 'current' : undefined);
  const previewRef = useRef(preview);
  useEffect(() => {
    previewRef.current = preview;
  }, [preview]);
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
      // Seen and heard: a soft note when the thumbnail comes; not while the place's own photo
      // waits for ✓, where it would sound like a choice made (spec 037).
      if (found && previewRef.current !== 'current') playCue('select');
    });
    return () => controller.abort();
  }, [lng, lat]);

  // The camera only runs while its shutter shows: not behind a photo waiting for ✓, so a place
  // changed for its pictogram alone never asks for the camera nor lights its sign (spec 037).
  const shutterShown = preview === undefined;
  // The camera window opens once the shutter shows, once (Android's text, read by the companion).
  useEffect(() => {
    if (!shutterShown) return;
    if (permission && !permission.granted && permission.canAskAgain) void requestPermission();
  }, [shutterShown, permission, requestPermission]);

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
    setPreview(undefined);
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
  const shown = preview === 'street' ? found : undefined;
  const keepingCurrent = preview === 'current' && current !== undefined;
  const keepingNone = preview === 'none';
  const toggle = (which: Preview) => setPreview((open) => (open === which ? undefined : which));

  return (
    <View style={styles.screen}>
      {cameraOn && shutterShown && (
        <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" />
      )}
      {keepingNone && (
        // The place as it will be: its pictogram, no photo; ✓ removes the photo (spec 037).
        <View testID="no-photo-preview" style={[styles.frame, styles.preview, styles.bare]}>
          <Icon
            name={draft?.icon ?? draft?.editing?.icon ?? 'no_photography'}
            size={120}
            color={colors.emerald}
            variant="outlined"
          />
        </View>
      )}
      {shown && (
        <View testID="street-photo-preview" style={[styles.frame, styles.preview]}>
          <StreetPhotoView photo={shown} />
        </View>
      )}
      {keepingCurrent && (
        <View style={[styles.frame, styles.preview]}>
          <Image
            testID="current-photo-preview"
            source={{ uri: current }}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}
      <View style={styles.frame} pointerEvents="none" />
      <MapHeader
        left={
          <IconButton
            icon="arrow_back"
            label="Retour"
            // Back closes a preview opened by a touch (street photo, spec 033; no photo, spec
            // 037); the place's own photo, open from the start, is no step: back goes to the
            // pictogram (spec 037).
            onPress={() =>
              preview === 'street' || preview === 'none' ? setPreview(undefined) : router.back()
            }
            tone="raised"
          />
        }
        right={<HelpButton onPress={() => router.push('/help')} />}
      />
      <View
        style={[styles.controls, { height: 190 + insets.bottom, paddingBottom: insets.bottom }]}
      >
        <View>
          {/* The place's own photo (spec 037), above « no photo », like the street photo above
              the picker: a touch opens or closes it in the frame. */}
          {current && (
            <View style={styles.above}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Photo actuelle du lieu"
                accessibilityState={{ selected: keepingCurrent, disabled: locked }}
                disabled={locked}
                onPress={() => toggle('current')}
                style={[styles.thumbnail, keepingCurrent && styles.thumbnailOpen]}
              >
                <View style={styles.thumbnailPhoto}>
                  <Image
                    source={{ uri: current }}
                    resizeMode="cover"
                    style={StyleSheet.absoluteFill}
                  />
                </View>
                {draft?.editing && (
                  <View style={styles.thumbnailBadge}>
                    <Icon name={draft.editing.icon} size={14} color={colors.white} />
                  </View>
                )}
              </Pressable>
            </View>
          )}
          {/* Removing its own photo destroys it: like the other choices, first seen, then ✓
              (UX review of spec 037). Without a photo of its own, « no photo » finishes. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sans photo"
            accessibilityState={{ selected: keepingNone, disabled: locked }}
            disabled={locked}
            onPress={() => (current ? toggle('none') : finish())}
            style={[styles.side, keepingNone && styles.sideOpen, locked && styles.busy]}
          >
            <Icon name="no_photography" size={28} color={colors.emerald} variant="outlined" />
          </Pressable>
        </View>
        {keepingNone ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Garder sans photo"
            accessibilityState={{ disabled: locked }}
            disabled={locked}
            onPress={() => finish()}
            style={[styles.shutter, styles.keep, locked && styles.busy]}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} size="large" />
            ) : (
              <Icon name="check" size={48} color={colors.white} />
            )}
          </Pressable>
        ) : keepingCurrent ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Garder la photo actuelle"
            accessibilityState={{ disabled: locked }}
            disabled={locked}
            onPress={() => finish(current)}
            style={[styles.shutter, styles.keep, locked && styles.busy]}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} size="large" />
            ) : (
              <Icon name="check" size={48} color={colors.white} />
            )}
          </Pressable>
        ) : shown ? (
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
                accessibilityState={{ selected: preview === 'street', disabled: locked }}
                disabled={locked}
                onPress={() => toggle('street')}
                style={[styles.thumbnail, preview === 'street' && styles.thumbnailOpen]}
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
  // The place without photo: its pictogram on warm white, like a pin without photo.
  bare: {
    backgroundColor: colors.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // « No photo » open: ringed in emerald and a little larger, like an open thumbnail.
  sideOpen: {
    borderWidth: 3,
    borderColor: colors.emerald,
    transform: [{ scale: 1.1 }],
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
