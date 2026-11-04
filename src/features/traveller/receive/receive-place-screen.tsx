import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { pictogramName } from '@/domain/pictograms';
import { hiddenOnMapByDefault } from '@/domain/place';
import { decodeShareLink, findSamePlace } from '@/domain/share-link';
import { playCue } from '@/services/feedback';
import { PlacePin } from '@/ui/components/place-pin';
import { Icon } from '@/ui/icon/icon';
import { colors, shadows } from '@/ui/theme';

import { useTripPlan } from '../trip-plan/trip-plan-context';
import { newPlaceId, useSavePlace } from '../trip-plan/use-save-place';
import { takePendingLink } from './pending-link';

/** How long the check or the cross stays before going back. */
const SHOWN_MS = 1800;
/** No save after this: the cross, never a blank screen without a way out. */
const GIVE_UP_MS = 4000;
const DISC_SIZE = 120;
const CHECK_SIZE = 64;

type Outcome = { kind: 'saving' } | { kind: 'added' } | { kind: 'failed' };

/**
 * A share link touched in WhatsApp or a text message (specs 001 D, 019): the place is added
 * at once, without a question; its pin and a green check, with the « saved » sound and
 * vibration; then back to where the traveller was. A damaged or forged link adds nothing:
 * red cross and the alert. The same place twice gives no duplicate. The link is read once,
 * from the system's hand-over only (securite.md §3).
 */
export function ReceivePlaceScreen() {
  const [url] = useState(takePendingLink);
  const { customPlaces } = useTripPlan();
  const savePlace = useSavePlace();
  const [saveFailed, setSaveFailed] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const started = useRef(false);

  const decoded = url === null ? null : decodeShareLink(url);
  const shared = decoded?.ok ? decoded.place : undefined;
  const known = shared ? findSamePlace(customPlaces, shared) : undefined;
  const outcome: Outcome =
    !shared || saveFailed
      ? { kind: 'failed' }
      : known
        ? { kind: 'added' }
        : gaveUp
          ? { kind: 'failed' }
          : { kind: 'saving' };

  // A new place: saved once; it then shows as known, that is added.
  useEffect(() => {
    if (started.current || !shared || known) return;
    started.current = true;
    savePlace(
      {
        id: newPlaceId(),
        icon: shared.icon,
        point: shared.point,
        // The link carries no name: the help card reads the pictogram's (spec 019).
        helpName: pictogramName(shared.icon),
        hiddenOnMap: hiddenOnMapByDefault(shared.icon),
        createdAt: Date.now(),
      },
      { keepDraft: true },
    ).then((saved) => {
      if (!saved) setSaveFailed(true);
    });
  }, [shared, known, savePlace]);

  useEffect(() => {
    const timer = setTimeout(() => setGaveUp(true), GIVE_UP_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (outcome.kind === 'saving') return;
    playCue(outcome.kind === 'added' ? 'saved' : 'alert');
    // Back to the screen the link came over (a trip in progress), else the home.
    const timer = setTimeout(
      () => (router.canGoBack() ? router.back() : router.replace('/')),
      SHOWN_MS,
    );
    return () => clearTimeout(timer);
  }, [outcome.kind]);

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
