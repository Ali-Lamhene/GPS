import { StyleSheet, Text } from 'react-native';

import { colors, fontFamilies } from '@/ui/theme';

// Decision D9: the help card's French message is one of the three texts on the traveller's
// screens. It is written for the passer-by the traveller shows the phone to.

type HelpMessageProps = {
  message: string;
  large: boolean;
};

export function HelpMessage({ message, large }: HelpMessageProps) {
  const fontSize = large ? 34 : 25;
  return (
    <Text style={[styles.message, { fontSize, lineHeight: Math.round(fontSize * 1.3) }]}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  message: {
    paddingHorizontal: 8,
    fontFamily: fontFamilies.medium,
    color: colors.ink,
  },
});
