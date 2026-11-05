import { Pressable, StyleSheet, View } from 'react-native';

import { MainActionButton } from '@/ui/components/main-action-button';
import { Icon } from '@/ui/icon/icon';
import { colors, shadows, spacing } from '@/ui/theme';

const CANCEL_SIZE = 56;

type CancelConfirmProps = {
  onCancel: () => void;
  onConfirm: () => void;
  /** Read by screen readers only. */
  cancelLabel: string;
  confirmLabel: string;
};

/**
 * The traveller's yes or no (specs 011, 023): a round white ✕ on the left, the emerald ✓
 * pill on the right. The same pair wherever a choice is confirmed, so it is learnt once.
 */
export function CancelConfirm({
  onCancel,
  onConfirm,
  cancelLabel,
  confirmLabel,
}: CancelConfirmProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={cancelLabel}
        onPress={onCancel}
        style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
      >
        <Icon name="close" size={28} color={colors.ink} />
      </Pressable>
      <View style={styles.confirm}>
        <MainActionButton icon="check" label={confirmLabel} tone="emerald" onPress={onConfirm} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cancel: {
    width: CANCEL_SIZE,
    height: CANCEL_SIZE,
    borderRadius: CANCEL_SIZE / 2,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.warmEdge,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.warm,
  },
  confirm: {
    flex: 1,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
});
