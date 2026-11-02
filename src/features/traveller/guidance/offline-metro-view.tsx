import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { TransitLeg } from '@/domain/trip';
import { HelpButton } from '@/ui/components/help-button';
import { Icon } from '@/ui/icon/icon';
import { colors, radii, shadows, sizes, spacing } from '@/ui/theme';

import { LineBadge, MetroSign } from '../components/line-badge';
import { ListenButton } from '../components/listen-button';
import { LineProgress } from './line-progress';

type OfflineMetroViewProps = {
  leg: TransitLeg;
  /** How far along the leg, from the saved trip. */
  fraction: number;
  onGotOff: () => void;
  onHelp: () => void;
};

/**
 * E21: no network underground. Calm dark screen with the line drawn as its stations, from
 * the saved trip, and the station to get off at; the traveller confirms getting off
 * themselves (docs/screens.md, 4.7).
 */
export function OfflineMetroView({ leg, fraction, onGotOff, onHelp }: OfflineMetroViewProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 28 },
      ]}
    >
      <View style={styles.top}>
        <View style={styles.bar}>
          <Icon name="cloud_off" size={28} color={colors.night.inkMuted} variant="outlined" />
        </View>
        {/* Same place as on every other screen: top right. */}
        <HelpButton onPress={onHelp} tone="night" />
      </View>
      <View style={styles.line}>
        <MetroSign color={leg.line.color} size={72} />
        <LineBadge line={{ ...leg.line, shape: 'pill' }} size="banner" />
        <View style={styles.spacer} />
        <ListenButton name={leg.to} tone="nightAccent" shape="square" size={64} iconSize={32} />
      </View>
      <View style={styles.stations}>
        <LineProgress leg={leg} fraction={fraction} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Je suis descendu"
        onPress={onGotOff}
        style={styles.gotOff}
      >
        <Icon name="logout" size={38} color={colors.onPrimary} variant="outlined" />
        <Icon name="check" size={38} color={colors.onPrimary} variant="outlined" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.night.background,
    paddingHorizontal: 16,
    gap: 16,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bar: {
    flex: 1,
    height: sizes.headerButton,
    justifyContent: 'center',
    backgroundColor: colors.night.bar,
    borderRadius: sizes.headerButton / 2,
    paddingHorizontal: 16,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  stations: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.night.card,
    borderRadius: radii.sheet,
    paddingVertical: 16,
  },
  spacer: {
    flex: 1,
  },
  gotOff: {
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    boxShadow: shadows.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
