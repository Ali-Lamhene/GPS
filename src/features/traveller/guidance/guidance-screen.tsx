import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { bearingAlong, findTurns, splitPath } from '@/domain/geo';
import { spokenName, type GuidanceStep } from '@/domain/guidance';
import { remainingMinutes, tripPosition, tripProgress, type Leg } from '@/domain/trip';
import { playCue } from '@/services/feedback';
import { TripMap } from '@/ui/map/trip-map';
import type { MapLine, MapStop } from '@/ui/map/trip-map-types';
import { colors } from '@/ui/theme';

import { legColor } from '../components/leg-style';
import { DEMO_GUIDANCE } from '../demo/guidance';
import { DEMO_LEGS } from '../demo/trips';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import { InstructionCard } from './instruction-card';
import { stepCue } from './instruction-look';
import { OfflineMetroView } from './offline-metro-view';
import { ProgressPanel } from './progress-panel';

/**
 * The route ahead in colour (walking dotted blue, vehicles in their line colour) and the
 * part already done in grey, cut where the traveller is.
 */
function mapLines(legs: readonly Leg[], step: GuidanceStep): MapLine[] {
  return legs.flatMap((leg, i): MapLine[] => {
    const ahead: MapLine['style'] = leg.kind === 'walk' ? 'walk' : 'vehicle';
    const color = leg.kind === 'walk' ? colors.primary : legColor(leg);
    if (i < step.legIndex) return [{ path: leg.path, color, style: 'done' }];
    if (i > step.legIndex) return [{ path: leg.path, color, style: ahead }];
    const [done, rest] = splitPath(leg.path, step.legFraction);
    return [
      { path: done, color, style: 'done' },
      { path: rest, color, style: ahead },
    ];
  });
}

/** Where to get on and off each vehicle. */
function mapStops(legs: readonly Leg[]): MapStop[] {
  return legs.flatMap((leg): MapStop[] => {
    if (leg.kind !== 'bus' && leg.kind !== 'metro') return [];
    const symbol = leg.kind === 'metro' ? 'metro' : 'directions_bus';
    return [leg.path[0], leg.path.at(-1)]
      .filter((point) => point !== undefined)
      .map((point) => ({ point, color: leg.line.color, symbol }));
  });
}

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
          lines={mapLines(legs, step)}
          stops={mapStops(legs)}
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
