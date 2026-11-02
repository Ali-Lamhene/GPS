import { router, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { GuidanceStep, Instruction } from '@/domain/guidance';
import { DEMO_GUIDANCE } from '@/features/traveller/demo/guidance';
import { useTripPlan } from '@/features/traveller/trip-plan/trip-plan-context';
import type { TripPlanAction } from '@/features/traveller/trip-plan/trip-plan-reducer';
import { colors, fontFamilies } from '@/ui/theme';

// Development only: opens any screen of the mockup v7 with a trip already set up, to check
// them without walking through the whole flow. The route redirects home in release builds.

type Entry = { label: string; href: Href; actions: TripPlanAction[] };

const READY: TripPlanAction[] = [
  { type: 'reset' },
  { type: 'chooseOrigin', placeId: 'home' },
  { type: 'chooseDestination', placeId: 'beach' },
];

const INSTRUCTION_LABELS: Record<Instruction['kind'], string> = {
  walk: 'Navigation à pied',
  walkToDestination: 'Marche finale',
  reachStop: "Arrivée à l'arrêt",
  waitVehicle: 'Attente du véhicule',
  ride: 'À bord',
  getOffSoon: 'Approche de la descente',
  gotOff: 'Descente du véhicule',
  leaveStation: 'Sortie de la station',
};

function stepLabel({ instruction, offline }: GuidanceStep, index: number): string {
  const name =
    instruction.kind === 'walk' && instruction.turn !== 'straight'
      ? `Tourner à ${instruction.turn === 'left' ? 'gauche' : 'droite'}`
      : offline
        ? 'Métro hors connexion'
        : INSTRUCTION_LABELS[instruction.kind];
  return `Guidage ${index + 1} · ${name}`;
}

const ENTRIES: Entry[] = [
  { label: '01 Accueil', href: '/', actions: [{ type: 'reset' }] },
  {
    label: '03 Départ sélectionné',
    href: '/',
    actions: [{ type: 'reset' }, { type: 'chooseOrigin', placeId: 'home' }],
  },
  { label: '05 Arrivée sélectionnée', href: '/', actions: READY },
  { label: '06 Choix du transport', href: '/mode', actions: READY },
  { label: '07 Récapitulatif', href: '/summary', actions: READY },
  ...DEMO_GUIDANCE.transit.map((step, index) => ({
    label: stepLabel(step, index),
    href: '/guidance' as const,
    actions: [...READY, { type: 'goToStep', index } as const],
  })),
  {
    label: '24 Aide contextuelle',
    href: '/help',
    actions: [...READY, { type: 'goToStep', index: 4 }],
  },
  { label: '25 Problème de connexion', href: '/connection-error', actions: READY },
  { label: '26 Arrivée à destination', href: '/arrived', actions: READY },
  {
    label: '27 Nouveau lieu · position',
    href: '/add-place/position',
    actions: [...READY, { type: 'startPlace', source: 'position' }],
  },
  {
    label: '30 Nouveau lieu · adresse',
    href: '/add-place/address',
    actions: [...READY, { type: 'startPlace', source: 'address' }],
  },
];

export function ScreenGallery() {
  const insets = useSafeAreaInsets();
  const { dispatch } = useTripPlan();

  const open = ({ href, actions }: Entry) => {
    actions.forEach(dispatch);
    router.push(href);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}
    >
      {ENTRIES.map((entry) => (
        <Pressable
          key={entry.label}
          accessibilityRole="button"
          onPress={() => open(entry)}
          style={styles.entry}
        >
          <Text style={styles.label}>{entry.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  entry: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceHighest,
  },
  label: {
    fontSize: 16,
    fontFamily: fontFamilies.medium,
    color: colors.ink,
  },
});
