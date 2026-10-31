import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { TransitLeg } from '@/domain/trip';
import { HelpButton } from '@/ui/components/help-button';
import { Icon } from '@/ui/icon/icon';
import { colors, radii } from '@/ui/theme';

import { LineBadge, MetroSign } from '../components/line-badge';
import { ListenButton } from '../components/listen-button';
import { StationName } from '../components/station-name';

type OfflineMetroViewProps = {
  leg: TransitLeg;
  onGotOff: () => void;
  onHelp: () => void;
};

/**
 * E21: no network underground. Calm dark screen with the station to get off at, from the
 * saved trip; the traveller confirms getting off themselves (docs/screens.md, 4.7).
 */
export function OfflineMetroView({ leg, onGotOff, onHelp }: OfflineMetroViewProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.screen, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 28 }]}
    >
      <View style={styles.bar}>
        <Icon name="cloud_off" size={28} color={colors.night.inkMuted} variant="outlined" />
        <HelpButton onPress={onHelp} tone="night" />
      </View>
      <View style={styles.line}>
        <MetroSign color={leg.line.color} size={72} />
        <LineBadge line={{ ...leg.line, shape: 'pill' }} size="banner" />
      </View>
      <View style={styles.station}>
        <Icon name="logout" size={30} color={colors.night.inkMuted} variant="outlined" />
        <StationName name={leg.to} variant="large" color={colors.night.ink} style={styles.name} />
        <ListenButton name={leg.to} tone="nightAccent" shape="square" size={64} iconSize={32} />
      </View>
      <View style={styles.spacer} />
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
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.night.bar,
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingRight: 8,
    paddingLeft: 16,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  station: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.night.card,
    borderRadius: radii.xl,
    paddingVertical: 20,
    paddingRight: 16,
    paddingLeft: 20,
  },
  name: {
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  gotOff: {
    height: 80,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
