import { useEffect } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';

import type { IntroMode } from '@/domain/permission-intro';
import { playCue } from '@/services/feedback';
import { IconButton } from '@/ui/components/icon-button';
import { MainActionButton } from '@/ui/components/main-action-button';
import { Icon, type IconName } from '@/ui/icon/icon';
import { colors, radii, shadows, spacing } from '@/ui/theme';

import { useCueOnEnter } from '../hooks/use-cue-on-enter';

export type IntroKind = 'location' | 'camera';

type PermissionIntroScreenProps = {
  kind: IntroKind;
  mode: IntroMode;
  /** The pictogram of the place a photo is for (camera), drawn after the camera. */
  placeIcon?: IconName;
  /** ✓: the system window opens (ask), or the settings (settings). */
  onAccept: () => void;
  /** ✗: not now. The Android back gesture does the same. */
  onSkip: () => void;
};

/** The round sign at the head of the drawing of the system window. */
const KIND_ICON: Record<IntroKind, IconName> = {
  location: 'person_pin_circle',
  camera: 'photo_camera',
};

/**
 * Spec 038: the screen before a permission window, without text. What the app needs, drawn
 * (the phone that knows where « me » is, or the camera and its place); below, the system
 * window with the right choice ringed (a hint: the real window is text, read by the
 * companion); then ✓ (go on) above ✗ (not now), in a column so the order never depends on the
 * reading direction. When Android no longer asks, the drawing is the switch of the settings
 * and ✓ opens them.
 */
export function PermissionIntroScreen({
  kind,
  mode,
  placeIcon,
  onAccept,
  onSkip,
}: PermissionIntroScreenProps) {
  useCueOnEnter('permission');

  // The system back gesture is « not now », not a way out of the app from behind this screen.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onSkip();
      return true;
    });
    return () => subscription.remove();
  }, [onSkip]);

  return (
    <View testID={`permission-intro-${kind}-${mode}`} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {kind === 'location' ? <PhoneKnowsWhereIAm /> : <CameraForPlace placeIcon={placeIcon} />}
        <Icon name="arrow_downward" size={44} color={colors.inkMuted} />
        {mode === 'ask' ? <SystemWindowDrawing kind={kind} /> : <SettingsDrawing />}
      </ScrollView>
      <View style={styles.actions}>
        <MainActionButton
          icon="check"
          label="Continuer"
          onPress={() => {
            playCue('saved');
            onAccept();
          }}
        />
        <View style={styles.skip}>
          <IconButton
            icon="close"
            label="Pas maintenant"
            tone="tonal"
            size={64}
            iconSize={32}
            onPress={() => {
              // Felt as well as seen: « here » is crossed out right after.
              playCue('unavailable');
              onSkip();
            }}
          />
        </View>
      </View>
    </View>
  );
}

/** A phone whose little map shows « me here »: the app needs to know where the traveller is. */
function PhoneKnowsWhereIAm() {
  return (
    <View testID="permission-phone-drawing" style={styles.phone}>
      <View style={styles.map}>
        <View style={[styles.road, styles.roadAcross]} />
        <View style={[styles.road, styles.roadDown]} />
        <Icon name="person_pin_circle" size={72} color={colors.emerald} />
      </View>
    </View>
  );
}

/** The camera, and the place its photo is for. */
function CameraForPlace({ placeIcon }: { placeIcon?: IconName }) {
  return (
    <View testID="permission-camera-drawing" style={styles.cameraDrawing}>
      <View style={styles.disc}>
        <Icon name="photo_camera" size={64} color={colors.emerald} />
      </View>
      <Icon name="arrow_downward" size={36} color={colors.inkMuted} />
      <View style={styles.disc}>
        <Icon name={placeIcon ?? 'location_on'} size={64} color={colors.emerald} />
      </View>
    </View>
  );
}

/**
 * The window of the system: its round sign, then the choices as stacked bars. The first
 * (« while using ») is ringed and darker, with the finger; the last is crossed: not that one.
 */
function SystemWindowDrawing({ kind }: { kind: IntroKind }) {
  return (
    <View testID="permission-window-drawing" style={styles.card}>
      <View style={styles.sign}>
        <Icon name={KIND_ICON[kind]} size={40} color={colors.emerald} />
      </View>
      <View style={[styles.row, styles.chosen]}>
        <Icon name="check_circle" size={32} color={colors.emerald} />
        <View style={[styles.bar, styles.barChosen]} />
        <Icon name="touch_app" size={36} color={colors.emerald} />
      </View>
      <View style={styles.row}>
        <View style={[styles.bar, styles.barShort]} />
      </View>
      <View style={[styles.row, styles.denied]}>
        <Icon name="close" size={32} color={colors.inkMuted} />
        <View style={[styles.bar, styles.barShort]} />
      </View>
    </View>
  );
}

/** The settings: the switch is off, then on: the one to turn, with the finger. */
function SettingsDrawing() {
  return (
    <View testID="permission-settings-drawing" style={styles.card}>
      <View style={styles.sign}>
        <Icon name="settings" size={40} color={colors.inkMuted} />
      </View>
      <View style={styles.row}>
        <View style={[styles.bar, styles.barShort]} />
        <Icon name="toggle_off" size={56} color={colors.inkDisabled} />
      </View>
      <Icon name="arrow_downward" size={32} color={colors.inkMuted} style={styles.between} />
      <View style={[styles.row, styles.chosen]}>
        <View style={[styles.bar, styles.barChosen]} />
        <Icon name="toggle_on" size={56} color={colors.emerald} />
        <Icon name="touch_app" size={36} color={colors.emerald} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface,
    justifyContent: 'space-between',
    padding: spacing.xxl,
    paddingTop: spacing.xxl * 2,
    gap: spacing.lg,
  },
  body: {
    flexGrow: 1,
    alignItems: 'center',
    gap: spacing.lg,
  },
  phone: {
    width: 148,
    height: 200,
    borderRadius: radii.sheet,
    borderWidth: 6,
    borderColor: colors.ink,
    backgroundColor: colors.mapGround,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  road: {
    position: 'absolute',
    backgroundColor: colors.white,
  },
  roadAcross: {
    left: 0,
    right: 0,
    top: '62%',
    height: 14,
  },
  roadDown: {
    top: 0,
    bottom: 0,
    left: '28%',
    width: 14,
  },
  cameraDrawing: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  disc: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.emeraldHalo,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.warm,
  },
  card: {
    alignSelf: 'stretch',
    backgroundColor: colors.white,
    borderRadius: radii.sheet,
    borderWidth: 2,
    borderColor: colors.warmEdge,
    padding: spacing.lg,
    gap: spacing.md,
    boxShadow: shadows.card,
  },
  sign: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  between: {
    alignSelf: 'center',
  },
  row: {
    minHeight: 64,
    borderRadius: radii.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  chosen: {
    backgroundColor: colors.accentSoft,
    borderWidth: 4,
    borderColor: colors.emerald,
  },
  denied: {
    opacity: 0.6,
  },
  bar: {
    flex: 1,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.handle,
  },
  barChosen: {
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.emerald,
  },
  barShort: {
    flex: 0,
    width: '55%',
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.lg,
  },
  skip: {
    alignSelf: 'center',
  },
});
