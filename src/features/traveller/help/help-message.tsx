import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamilies, radii, shadows } from '@/ui/theme';

// Decision D9: the help card's French message is one of the three texts on the traveller's
// screens. It is written for the passer-by the traveller shows the phone to.

type HelpMessageProps = {
  message: string;
  large: boolean;
};

export function HelpMessage({ message, large }: HelpMessageProps) {
  const fontSize = large ? 34 : 25;
  return (
    // A white card, like every panel of the app (spec 008).
    <View style={styles.card}>
      <Text style={[styles.message, { fontSize, lineHeight: Math.round(fontSize * 1.3) }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: radii.sheet,
    backgroundColor: colors.warmWhite,
    boxShadow: shadows.card,
  },
  message: {
    fontFamily: fontFamilies.medium,
    color: colors.ink,
  },
});
