import { StyleSheet, View } from 'react-native';

import { colors, radii } from '@/ui/theme';

import { IconButton } from './icon-button';
import { PulseRing } from './pulse-ring';

type HelpButtonProps = {
  onPress: () => void;
  tone?: 'help' | 'glass' | 'night';
  shape?: 'circle' | 'square';
  size?: number;
  iconSize?: number;
  /** Lost for a while (spec 034): an orange ring pulses around help. */
  pulse?: boolean;
};

/** Opens the help card (D10). Present on every traveller screen. */
/** Help keeps its size of before (spec 010): the safety net of a stressed traveller. */
const HELP_SIZE = 56;

export function HelpButton({ onPress, tone = 'help', pulse, ...rest }: HelpButtonProps) {
  const button = (
    <IconButton
      icon="help"
      label="Aide"
      onPress={onPress}
      tone={tone}
      size={HELP_SIZE}
      iconSize={30}
      {...rest}
    />
  );
  const size = rest.size ?? HELP_SIZE;
  const radius = rest.shape === 'square' ? radii.control : size / 2;
  // Always the same parent: the button is never remounted under a finger (spec 034).
  return (
    <View>
      {button}
      {pulse && (
        <>
          {/* Still and thick, seen in sunlight and without motion; the pulse comes on top. */}
          <View
            testID="help-pulse"
            pointerEvents="none"
            style={[styles.stuck, { borderRadius: radius }]}
          />
          <PulseRing borderRadius={radius} color={colors.alert} spread={0.12} inset={4} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stuck: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 4,
    borderColor: colors.alert,
  },
});
