import { Pressable, StyleSheet, View } from 'react-native';

import { CURRENT_POSITION, isHiddenOnMap, isLocalPicture, type Place } from '@/domain/place';
import { categoryOfIcon } from '@/domain/place-category';
import { PlaceArt } from '@/ui/components/place-art';
import { colors, radii } from '@/ui/theme';

type PlaceCardProps = {
  place: Place;
  width: number;
  height: number;
  onPress: () => void;
};

/**
 * Big card of the home carousel (spec 008): the vivid colour of the place's family, its
 * large white pictogram at the top left and a very large faded one running off the
 * corner; or its photo with a veil of that colour and the pictogram in a white square.
 * A place kept off the map (home, family) never shows its photo here: the home is seen
 * as soon as the app opens.
 */
export function PlaceCard({ place, width, height, onPress }: PlaceCardProps) {
  const here = place.id === CURRENT_POSITION.id;
  const shown: Place = here ? { ...place, icon: 'my_location' } : place;
  const deep = colors.category[categoryOfIcon(shown.icon)];
  const showPhoto = !isHiddenOnMap(place) && !!place.photo && isLocalPicture(place.photo);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={place.helpName ?? 'Lieu'}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { width, height, boxShadow: `0 14px 28px ${deep}55` },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.clip}>
        <PlaceArt
          place={shown}
          iconSize={Math.round(height * 0.34)}
          iconAt="corner"
          faded={Math.round(height * 0.95)}
          showPhoto={showPhoto}
          badgeSize={52}
          veil
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.placeCard,
  },
  clip: {
    ...StyleSheet.absoluteFill,
    borderRadius: radii.placeCard,
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
