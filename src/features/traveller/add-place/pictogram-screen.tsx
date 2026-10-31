import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { FloatingSheet } from '@/ui/components/floating-sheet';
import { HelpButton } from '@/ui/components/help-button';
import { IconButton } from '@/ui/components/icon-button';
import { MainActionButton } from '@/ui/components/main-action-button';
import { MapHeader } from '@/ui/components/map-header';
import { Icon } from '@/ui/icon/icon';
import { TripMap } from '@/ui/map/trip-map';
import { colors } from '@/ui/theme';

import { DEMO_CURRENT_POSITION } from '../demo/trips';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import { PictogramGrid } from './pictogram-grid';

/**
 * E28: choose the pictogram of the new place, over the map of where it is; the preview
 * shows the choice.
 */
export function PictogramScreen() {
  const { draft, dispatch } = useTripPlan();
  const icon = draft?.icon;

  return (
    <View style={styles.screen}>
      <TripMap
        camera={{ center: DEMO_CURRENT_POSITION, zoom: 16.5, padding: { top: 0, bottom: 360 } }}
        traveller={{ point: DEMO_CURRENT_POSITION }}
        backdrop
      />
      <MapHeader
        left={
          <IconButton
            icon="arrow_back"
            label="Retour"
            tone="raised"
            onPress={() => router.back()}
          />
        }
        right={<HelpButton onPress={() => router.push('/help')} />}
      />
      <FloatingSheet gap={16}>
        <View style={[styles.preview, icon && styles.previewChosen]}>
          <Icon
            name={icon ?? 'add_location_alt'}
            size={52}
            color={icon ? colors.white : colors.inkDisabled}
          />
        </View>
        <PictogramGrid
          selected={icon}
          onSelect={(next) => dispatch({ type: 'setDraftIcon', icon: next })}
        />
        <MainActionButton
          icon="arrow_forward"
          label="Continuer"
          shape="bar"
          disabled={!icon}
          onPress={() => router.push('/add-place/photo')}
        />
      </FloatingSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.mapGround,
  },
  preview: {
    alignSelf: 'center',
    marginTop: -64,
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,.18)',
  },
  previewChosen: {
    backgroundColor: colors.ink,
  },
});
