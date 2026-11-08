import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { LngLat } from '@/domain/geo';
import { pictogramName } from '@/domain/pictograms';
import { hiddenOnMapByDefault } from '@/domain/place';
import { receivedPlaceCamera } from '@/domain/received-place';
import { decodeShareLink, findSamePlace } from '@/domain/share-link';
import { reverseAddress } from '@/services/address-search';
import { playCue } from '@/services/feedback';
import { useIsOffline } from '@/services/network';
import { CancelConfirm } from '@/ui/components/cancel-confirm';
import { HelpButton } from '@/ui/components/help-button';
import { MapHeader } from '@/ui/components/map-header';
import { PlacePin } from '@/ui/components/place-pin';
import { Icon } from '@/ui/icon/icon';
import { TripMap } from '@/ui/map/trip-map';
import { colors, shadows, spacing } from '@/ui/theme';

import { positionPoint, useTravellerPosition } from '../location/location-context';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import { newPlaceId, useSavePlace } from '../trip-plan/use-save-place';
import { takePendingLink } from './pending-link';

/** How long the check or the cross stays before going back. */
const SHOWN_MS = 1800;
/** No save after this: the cross, never a blank screen without a way out. */
// Longer than the address lookup (5 s, spec 029) plus the write: never « failed » before
// the place is actually saved.
const GIVE_UP_MS = 8000;
const DISC_SIZE = 120;
const CHECK_SIZE = 64;
const RECEIVED_PIN_ID = 'received';
/** Height of the ✕ and ✓ row, kept clear of the map's own buttons. */
const ANSWER_HEIGHT = 56;

type Outcome =
  | { kind: 'asking' }
  | { kind: 'saving' }
  | { kind: 'added' }
  | { kind: 'refused' }
  | { kind: 'failed' };

/** Back to the screen the link came over (a trip in progress), else the home. */
function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/**
 * A share link touched in WhatsApp or a text message (specs 019, 023). Anyone can forge a
 * link, so a new place only comes in after the traveller's ✓: first the place on the map,
 * then ✕ or ✓. Nothing is kept before ✓, nor after ✕ or Android's back. A place already
 * kept shows its check at once; a damaged link, the red cross. The link is read once, from
 * the system's hand-over only (securite.md §3).
 */
export function ReceivePlaceScreen() {
  const insets = useSafeAreaInsets();
  const [url] = useState(takePendingLink);
  const { customPlaces } = useTripPlan();
  const { position } = useTravellerPosition();
  const offline = useIsOffline();
  const savePlace = useSavePlace();
  // One answer, and the first one wins: a ✓ landing just after ✕ or back never saves.
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null);
  const accepted = answer === 'yes';
  const [saveFailed, setSaveFailed] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const started = useRef(false);
  const traveller = positionPoint(position);
  // The frame takes the traveller where they stood when the question came: it does not
  // jump with every new GPS point while they look.
  const [frameFrom, setFrameFrom] = useState<LngLat | undefined>(traveller);
  if (!frameFrom && traveller) setFrameFrom(traveller);

  const decoded = url === null ? null : decodeShareLink(url);
  const shared = decoded?.ok ? decoded.place : undefined;
  const known = shared ? findSamePlace(customPlaces, shared) : undefined;
  const outcome: Outcome =
    !shared || saveFailed
      ? { kind: 'failed' }
      : known
        ? { kind: 'added' }
        : answer === 'no'
          ? { kind: 'refused' }
          : !accepted
            ? { kind: 'asking' }
            : gaveUp
              ? { kind: 'failed' }
              : { kind: 'saving' };

  const refuse = useCallback(() => setAnswer((before) => before ?? 'no'), []);
  const accept = useCallback(() => setAnswer((before) => before ?? 'yes'), []);
  const asking = outcome.kind === 'asking';

  // A link handed over while this screen was open is never read later (securite.md §3).
  useEffect(() => () => void takePendingLink(), []);

  // The place is saved once, only after ✓; it then shows as known, that is added.
  useEffect(() => {
    if (answer !== 'yes' || started.current || !shared || known) return;
    started.current = true;
    const hiddenOnMap = hiddenOnMapByDefault(shared.icon);
    // The link carries no address: asked once to Photon, for the help card (spec 029).
    const address = hiddenOnMap ? Promise.resolve(undefined) : reverseAddress(shared.point);
    void address
      .then((found) =>
        savePlace(
          {
            id: newPlaceId(),
            icon: shared.icon,
            point: shared.point,
            // The link carries no name: the help card reads the pictogram's (spec 019).
            helpName: pictogramName(shared.icon),
            address: found,
            hiddenOnMap,
            createdAt: Date.now(),
          },
          { keepDraft: true },
        ),
      )
      .then((saved) => {
        if (!saved) setSaveFailed(true);
      });
  }, [answer, shared, known, savePlace]);

  useEffect(() => {
    if (!accepted) return;
    const timer = setTimeout(() => setGaveUp(true), GIVE_UP_MS);
    return () => clearTimeout(timer);
  }, [accepted]);

  // A question waits: the sound and vibration the traveller knows from choosing.
  useEffect(() => {
    if (asking) playCue('select');
  }, [asking]);

  // Android's back answers ✕, only while this screen is in front: back from the help card
  // over it closes the help, never the question.
  useFocusEffect(
    useCallback(() => {
      if (!asking) return undefined;
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        refuse();
        return true;
      });
      return () => subscription.remove();
    }, [asking, refuse]),
  );

  useEffect(() => {
    if (outcome.kind === 'refused') {
      // Refusing is no mistake: no cross, no alarm, the screen just closes.
      playCue('select');
      leave();
      return;
    }
    if (outcome.kind !== 'added' && outcome.kind !== 'failed') return;
    playCue(outcome.kind === 'added' ? 'saved' : 'alert');
    const timer = setTimeout(leave, SHOWN_MS);
    return () => clearTimeout(timer);
  }, [outcome.kind]);

  if (outcome.kind === 'asking' && shared) {
    const answerBottom = insets.bottom + spacing.lg;
    return (
      <View testID="place-question" style={styles.question}>
        {offline ? (
          // No tiles without network: the pin alone, on the map's ground (warm white is
          // kept for the result, so the question never looks done).
          <View style={styles.pinAlone}>
            <PlacePin icon={shared.icon} photo={undefined} selected />
          </View>
        ) : (
          <TripMap
            camera={{
              ...receivedPlaceCamera(shared.point, frameFrom),
              padding: { top: insets.top + 96, bottom: answerBottom + ANSWER_HEIGHT + spacing.lg },
            }}
            controlsBottom={answerBottom + ANSWER_HEIGHT + 8}
            // The recenter button brings the received place back, not the traveller.
            recenterIcon={shared.icon}
            traveller={traveller ? { point: traveller } : undefined}
            pins={[
              {
                id: RECEIVED_PIN_ID,
                point: shared.point,
                icon: shared.icon,
                label: pictogramName(shared.icon),
                selected: true,
              },
            ]}
          />
        )}
        <MapHeader right={<HelpButton onPress={() => router.push('/help')} />} />
        <View style={[styles.answer, { bottom: answerBottom }]}>
          <CancelConfirm
            onCancel={refuse}
            onConfirm={accept}
            cancelLabel="Refuser ce lieu"
            confirmLabel="Ajouter ce lieu"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {outcome.kind === 'added' && shared && (
        // Which place came: its pin, with the check (spec 019).
        <Animated.View
          testID="place-received"
          entering={ZoomIn.springify().damping(12)}
          style={styles.received}
        >
          <PlacePin icon={shared.icon} photo={undefined} selected />
          <View style={styles.check}>
            <Icon name="check" size={40} color={colors.white} />
          </View>
        </Animated.View>
      )}
      {outcome.kind === 'failed' && (
        <Animated.View
          testID="place-refused"
          entering={ZoomIn.springify().damping(12)}
          style={styles.cross}
        >
          <Icon name="close" size={72} color={colors.white} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  question: {
    flex: 1,
    backgroundColor: colors.mapGround,
  },
  pinAlone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answer: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  received: {
    alignItems: 'center',
    gap: 16,
  },
  check: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: CHECK_SIZE / 2,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.sheet,
  },
  cross: {
    width: DISC_SIZE,
    height: DISC_SIZE,
    borderRadius: DISC_SIZE / 2,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.sheet,
  },
});
