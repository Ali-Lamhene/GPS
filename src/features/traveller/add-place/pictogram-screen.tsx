import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FRANCE_CENTER, FRANCE_ZOOM } from '@/domain/geo';
import { FloatingSheet } from '@/ui/components/floating-sheet';
import { HelpButton } from '@/ui/components/help-button';
import { IconButton } from '@/ui/components/icon-button';
import { MainActionButton } from '@/ui/components/main-action-button';
import { MapHeader } from '@/ui/components/map-header';
import { PlacePin } from '@/ui/components/place-pin';
import { TripMap } from '@/ui/map/trip-map';
import { colors } from '@/ui/theme';

import { positionPoint, useTravellerPosition } from '../location/location-context';
import { sendPlace } from './send-place';
import { useTripPlan } from '../trip-plan/trip-plan-context';
import { PictogramGrid } from './pictogram-grid';

/**
 * E28: choose the pictogram of the new place, over the map of where it is; the preview
 * shows the choice.
 */
export function PictogramScreen() {
  const { draft, dispatch } = useTripPlan();
  const icon = draft?.icon;
  // The place's point, else the traveller's (companion's address), else France (spec 017).
  const { position } = useTravellerPosition();
  const here = positionPoint(position);
  const center = draft?.point ?? here;
  const [sheetHeight, setSheetHeight] = useState(360);
  const [sending, setSending] = useState(false);

  return (
    <View style={styles.screen}>
      <TripMap
        camera={{
          center: center ?? FRANCE_CENTER,
          zoom: center ? 16.5 : FRANCE_ZOOM,
          padding: { top: 0, bottom: sheetHeight },
        }}
        traveller={here ? { point: here } : undefined}
        controlsBottom={sheetHeight + 8}
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
      <FloatingSheet gap={16} onHeight={setSheetHeight}>
        {/* The pin the new place will have on the map (spec 010). */}
        <View style={styles.preview}>
          <PlacePin icon={icon ?? 'add_location_alt'} photo={undefined} selected={!!icon} />
        </View>
        <PictogramGrid
          selected={icon}
          onSelect={(next) => dispatch({ type: 'setDraftIcon', icon: next })}
        />
        <MainActionButton
          icon={draft?.send ? 'send' : 'check'}
          label={draft?.send ? 'Envoyer' : 'Continuer'}
          disabled={!icon}
          onPress={async () => {
            // Sent by the companion (spec 019): share sheet, then home; nothing kept here.
            if (draft?.send) {
              if (sending) return;
              setSending(true);
              const sent = await sendPlace(draft);
              setSending(false);
              if (!sent) return;
              dispatch({ type: 'cancelPlace' });
              router.dismissTo('/');
              return;
            }
            router.push('/add-place/photo');
          }}
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
    marginTop: -96,
  },
});
