import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { HelpButton } from '@/ui/components/help-button';
import { IconButton } from '@/ui/components/icon-button';
import { MainActionButton } from '@/ui/components/main-action-button';
import { ScreenFrame } from '@/ui/components/screen-frame';
import { Icon } from '@/ui/icon/icon';
import { colors } from '@/ui/theme';

import { useTripPlan } from '../trip-plan/trip-plan-context';
import { PictogramGrid } from './pictogram-grid';

/** E28: choose the pictogram of the new place; the preview above shows the choice. */
export function PictogramScreen() {
  const { draft, dispatch } = useTripPlan();
  const icon = draft?.icon;

  return (
    <ScreenFrame
      action={
        <MainActionButton
          icon="arrow_forward"
          label="Continuer"
          disabled={!icon}
          onPress={() => router.push('/add-place/photo')}
        />
      }
    >
      <View style={styles.header}>
        <IconButton icon="arrow_back" label="Retour" onPress={() => router.back()} />
        <HelpButton onPress={() => router.push('/help')} />
      </View>
      <View style={[styles.preview, icon && styles.previewChosen]}>
        <Icon
          name={icon ?? 'add_location_alt'}
          size={64}
          color={icon ? colors.white : colors.inkDisabled}
        />
      </View>
      <PictogramGrid
        selected={icon}
        onSelect={(next) => dispatch({ type: 'setDraftIcon', icon: next })}
      />
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  preview: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 34,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewChosen: {
    backgroundColor: colors.ink,
  },
});
