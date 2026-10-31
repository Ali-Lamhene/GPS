import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { isTransitLeg, type Leg } from '@/domain/trip';
import { Icon, type IconName } from '@/ui/icon/icon';
import { PHOTOS } from '@/ui/photos';

import { ListenButton } from '../components/listen-button';
import { StationName } from '../components/station-name';

function Stop({ icon, name }: { icon: IconName; name: string }) {
  return (
    <View style={styles.stop}>
      <Icon name={icon} size={24} variant="outlined" />
      <StationName name={name} variant="row" style={styles.name} />
      <ListenButton name={name} />
    </View>
  );
}

/** Opened leg (E08): photo of the stop and where to get on and off. */
export function LegDetails({ leg }: { leg: Leg }) {
  if (!isTransitLeg(leg)) return null;
  return (
    <>
      {leg.photo && <Image source={PHOTOS[leg.photo]} contentFit="cover" style={styles.photo} />}
      <View style={styles.stops}>
        <Stop icon="login" name={leg.from} />
        <Stop icon="logout" name={leg.to} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: '100%',
    height: 120,
    borderRadius: 20,
  },
  stops: {
    gap: 8,
  },
  stop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  name: {
    flex: 1,
  },
});
