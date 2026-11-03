import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamilies } from '@/ui/theme';

// Decision D9: the only texts of the phone's map. The metro "M" is the official sign, like
// the line ids; the OpenStreetMap credit, required by its licence, stays folded behind ⓘ.

/** The white "M" inside a metro stop marker. */
export function MapMetroLetter() {
  return (
    <Text maxFontSizeMultiplier={1} style={styles.metro}>
      M
    </Text>
  );
}

/**
 * The map credit (spec 002, D9): a small ⓘ that unfolds the credit, and folds it back.
 * Plain text only: nothing in it opens a website.
 */
export function MapCredit() {
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Crédit de la carte"
      accessibilityState={{ expanded: open }}
      hitSlop={8}
      onPress={() => setOpen((value) => !value)}
      style={styles.credit}
    >
      <View style={styles.info}>
        <Text maxFontSizeMultiplier={1} style={styles.infoGlyph}>
          i
        </Text>
      </View>
      {open && (
        <Text maxFontSizeMultiplier={1.3} style={styles.creditText}>
          © OpenStreetMap, Protomaps
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  metro: {
    color: colors.white,
    fontFamily: fontFamilies.bold,
    fontSize: 22,
  },
  credit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,.85)',
  },
  info: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoGlyph: {
    color: colors.inkMuted,
    fontFamily: fontFamilies.bold,
    fontSize: 16,
  },
  creditText: {
    color: colors.ink,
    fontSize: 12,
  },
});
