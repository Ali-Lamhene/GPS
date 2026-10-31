import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spokenName } from '@/domain/guidance';
import { tripProgress } from '@/domain/trip';
import { playCue } from '@/services/feedback';
import { colors } from '@/ui/theme';

import { DEMO_GUIDANCE } from '../demo/guidance';
import { DEMO_LEGS } from '../demo/trips';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import { GuidanceVisual } from './guidance-visual';
import { InstructionCard } from './instruction-card';
import { stepCue } from './instruction-look';
import { OfflineMetroView } from './offline-metro-view';
import { ProgressPanel } from './progress-panel';

/**
 * E09-E23: one step of the trip at a time. In this static version (D11), touching the
 * instruction card stands for the traveller reaching the next step.
 */
export function GuidanceScreen() {
  const insets = useSafeAreaInsets();
  const { mode, destination, guidanceStep = 0, dispatch } = useTripPlan();
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

  return (
    <View style={styles.screen}>
      <View style={[styles.main, { paddingTop: insets.top + 16 }]}>
        <InstructionCard
          instruction={step.instruction}
          destination={destination}
          onPress={advance}
        />
        <GuidanceVisual visual={step.visual} destination={destination} />
      </View>
      <ProgressPanel
        legs={legs}
        progress={tripProgress(legs, step.legIndex, step.legFraction)}
        remainingMinutes={step.remainingMinutes}
        spokenName={spokenName(step.instruction)}
        onHelp={openHelp}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  main: {
    flex: 1,
    gap: 12,
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
});
