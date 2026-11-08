import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { distanceMeters, bearingAlong, findTurns, pathLength } from '@/domain/geo';
import { locateOnTrip, stepAt } from '@/domain/guidance-plan';
import { approachLeft, spokenName, type GuidanceStep } from '@/domain/guidance';
import { remainingMinutes, tripPosition, tripProgress, type Leg } from '@/domain/trip';
import { playCue } from '@/services/feedback';
import { TripMap } from '@/ui/map/trip-map';
import { HelpButton } from '@/ui/components/help-button';
import { colors, spacing } from '@/ui/theme';

import { tripLines, tripStops } from '../components/trip-map-layers';
import { positionPoint, useTravellerPosition } from '../location/location-context';
import { useRoutes } from '../trip-plan/routes-context';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import { InstructionCard } from './instruction-card';
import { stepCue } from './instruction-look';
import { OfflineMetroView } from './offline-metro-view';
import { ProgressPanel } from './progress-panel';
import { useFreshPoint } from './use-fresh-point';

/** For a turn, the corner ahead on the current leg. */
function nextCorner(legs: readonly Leg[], step: GuidanceStep) {
  const { instruction } = step;
  if (instruction.kind !== 'walk' || instruction.turn === 'straight') return undefined;
  const path = legs[step.legIndex]?.path ?? [];
  return findTurns(path).find((corner) => corner.fraction > step.legFraction);
}

/** The corner ahead and the direction of the street to take, drawn on the map. */
function nextManeuver(legs: readonly Leg[], step: GuidanceStep) {
  const turn = nextCorner(legs, step);
  const path = legs[step.legIndex]?.path ?? [];
  return turn && { point: turn.point, heading: bearingAlong(path, turn.fraction + 0.01) };
}

/**
 * E09-E23 (specs 002, 021): the map fills the screen and follows the traveller; the
 * instruction floats on top beside help, time left at the bottom. The phone's position moves
 * the guidance on, and ends it near the arrival; touching the instruction moves on only
 * without a recent position (underground, or when the position is lost).
 */
/** Within this distance of the arrival point, the trip is over. */
const ARRIVED_METERS = 25;

export function GuidanceScreen() {
  const insets = useSafeAreaInsets();
  const { origin, destination, guidanceStep = 0, dispatch } = useTripPlan();
  const [bannerHeight, setBannerHeight] = useState(0);
  const [panelHeight, setPanelHeight] = useState(0);
  const { steps, legs } = useRoutes();
  const step = steps[guidanceStep];
  const here = positionPoint(useTravellerPosition().position);
  const end = legs.at(-1)?.path.at(-1);
  const fresh = useFreshPoint(here);

  // The real position moves the guidance on, never back (spec 021).
  useEffect(() => {
    if (!here) return;
    const last = guidanceStep >= steps.length - 1;
    if (last && end && distanceMeters(here, end) <= ARRIVED_METERS) {
      router.replace('/arrived');
      return;
    }
    const next = stepAt(steps, legs, guidanceStep, here);
    if (next !== undefined) dispatch({ type: 'goToStep', index: next });
  }, [here, steps, legs, guidanceStep, end, dispatch]);

  useEffect(() => {
    const cue = step && stepCue(step);
    if (cue) playCue(cue);
  }, [step]);

  if (!step) return null;

  const goTo = (index: number) => dispatch({ type: 'goToStep', index });
  const advance = () => {
    if (guidanceStep + 1 < steps.length) goTo(guidanceStep + 1);
    else router.replace('/arrived');
  };
  const openHelp = () => router.push('/help');

  if (step.offline && 'leg' in step.instruction) {
    const exitIndex = steps.findIndex((s) => s.instruction.kind === 'leaveStation');
    return (
      <OfflineMetroView
        leg={step.instruction.leg}
        fraction={step.legFraction}
        onGotOff={() => goTo(exitIndex >= 0 ? exitIndex : guidanceStep + 1)}
        onHelp={openHelp}
      />
    );
  }

  // Where the traveller is along the trip: from the phone's position when it lies on the
  // trip, else where the step stands. Heading, approach and progress follow it (spec 021).
  const onTrip = here ? locateOnTrip(legs, step.legIndex, here) : undefined;
  const legIndex = onTrip?.legIndex ?? step.legIndex;
  const fraction = onTrip?.fraction ?? step.legFraction;
  const planned = tripPosition(legs, legIndex, fraction);
  const position = here && planned ? { point: here, heading: planned.heading } : planned;
  const destinationIcon = destination?.icon ?? 'flag';

  return (
    <View style={styles.screen}>
      {position && (
        <TripMap
          camera={{
            center: position.point,
            zoom: 17,
            heading: position.heading,
            pitch: 45,
            // Extra room on top puts the traveller low on the screen, to show the way ahead.
            padding: { top: bannerHeight + 140, bottom: panelHeight },
          }}
          lines={tripLines(legs, step)}
          stops={tripStops(legs)}
          maneuver={nextManeuver(legs, step)}
          traveller={{ point: position.point, heading: position.heading }}
          destination={end && { point: end, icon: destinationIcon }}
          controlsBottom={panelHeight + 8}
        />
      )}
      <View
        style={[styles.banner, { top: insets.top + spacing.md }]}
        onLayout={(event) =>
          setBannerHeight(event.nativeEvent.layout.height + insets.top + spacing.md)
        }
      >
        <View style={styles.card}>
          <InstructionCard
            instruction={step.instruction}
            destination={destination}
            approach={approachLeft(
              legIndex === step.legIndex ? fraction : step.legFraction,
              nextCorner(legs, step)?.fraction,
              pathLength(legs[step.legIndex]?.path ?? []),
            )}
            onPress={fresh ? undefined : advance}
          />
        </View>
        {/* Same place as on every other screen: top right. */}
        <HelpButton onPress={openHelp} />
      </View>
      <ProgressPanel
        origin={origin}
        destination={destination}
        progress={tripProgress(legs, legIndex, fraction)}
        remainingMinutes={remainingMinutes(legs, legIndex, fraction)}
        spokenName={spokenName(step.instruction)}
        onLayout={(event) => setPanelHeight(event.nativeEvent.layout.height)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.mapGround,
  },
  banner: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    // Keeps a stray thumb aiming at help off the banner, which is touchable.
    gap: spacing.md,
  },
  card: {
    flexShrink: 1,
  },
});
