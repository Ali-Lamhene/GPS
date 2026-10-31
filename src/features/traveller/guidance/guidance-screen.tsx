import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { bearingAlong, findTurns } from '@/domain/geo';
import { spokenName, type GuidanceStep } from '@/domain/guidance';
import { remainingMinutes, tripPosition, tripProgress, type Leg } from '@/domain/trip';
import { playCue } from '@/services/feedback';
import { TripMap } from '@/ui/map/trip-map';
import { colors } from '@/ui/theme';

import { tripLines, tripStops } from '../components/trip-map-layers';
import { DEMO_GUIDANCE } from '../demo/guidance';
import { DEMO_LEGS } from '../demo/trips';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import { InstructionCard } from './instruction-card';
import { stepCue } from './instruction-look';
import { OfflineMetroView } from './offline-metro-view';
import { ProgressPanel } from './progress-panel';

/** For a turn, the corner ahead on the current leg and the direction of the street to take. */
function nextManeuver(legs: readonly Leg[], step: GuidanceStep) {
  const { instruction } = step;
  if (instruction.kind !== 'walk' || instruction.turn === 'straight') return undefined;
  const path = legs[step.legIndex]?.path ?? [];
  const turn = findTurns(path).find((corner) => corner.fraction > step.legFraction);
  return turn && { point: turn.point, heading: bearingAlong(path, turn.fraction + 0.01) };
}

/**
 * E09-E23 (spec 002): the map fills the screen and follows the traveller; the instruction
 * floats on top, time and help at the bottom. In this static version (D11), touching the
 * instruction stands for reaching the next step.
 */
export function GuidanceScreen() {
  const insets = useSafeAreaInsets();
  const { mode, destination, guidanceStep = 0, dispatch } = useTripPlan();
  const [bannerHeight, setBannerHeight] = useState(0);
  const [panelHeight, setPanelHeight] = useState(0);
  const steps = DEMO_GUIDANCE[mode];
  const legs = DEMO_LEGS[mode];
  const step = steps[guidanceStep];

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
        onGotOff={() => goTo(exitIndex >= 0 ? exitIndex : guidanceStep + 1)}
        onHelp={openHelp}
      />
    );
  }

  const position = tripPosition(legs, step.legIndex, step.legFraction);
  const end = legs.at(-1)?.path.at(-1);
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
        style={[styles.banner, { top: insets.top + 12 }]}
        onLayout={(event) => setBannerHeight(event.nativeEvent.layout.height + insets.top + 12)}
      >
        <InstructionCard
          instruction={step.instruction}
          destination={destination}
          onPress={advance}
        />
      </View>
      <ProgressPanel
        legs={legs}
        progress={tripProgress(legs, step.legIndex, step.legFraction)}
        remainingMinutes={remainingMinutes(legs, step.legIndex, step.legFraction)}
        spokenName={spokenName(step.instruction)}
        destinationIcon={destinationIcon}
        onHelp={openHelp}
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
    left: 12,
    right: 12,
  },
});
