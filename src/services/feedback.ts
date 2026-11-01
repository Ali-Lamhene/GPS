import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { Platform, Vibration } from 'react-native';

// Non-verbal cues: every instruction reaches the traveller on a second channel, sound and
// often vibration (docs/product/principes.md, rule 3). Sounds are bundled, nothing is fetched.

export type Cue =
  'select' | 'turn' | 'alert' | 'vehicle' | 'exit' | 'offline' | 'arrival' | 'saved';

const SOUNDS: Record<Cue, number> = {
  select: require('../../assets/sounds/select.wav'),
  turn: require('../../assets/sounds/turn.wav'),
  alert: require('../../assets/sounds/alert.wav'),
  vehicle: require('../../assets/sounds/vehicle.wav'),
  exit: require('../../assets/sounds/exit.wav'),
  offline: require('../../assets/sounds/offline.wav'),
  arrival: require('../../assets/sounds/arrival.wav'),
  saved: require('../../assets/sounds/saved.wav'),
};

/** Vibration, then pause, then vibration… in milliseconds. */
const VIBRATIONS: Partial<Record<Cue, number[]>> = {
  turn: [80, 60, 80],
  alert: [200, 100, 200, 100, 200],
  exit: [120],
  offline: [400, 200, 400],
  arrival: [60, 40, 60, 40, 200],
  saved: [80],
};

const players = new Map<Cue, AudioPlayer>();

function playSound(cue: Cue) {
  let player = players.get(cue);
  if (!player) {
    player = createAudioPlayer(SOUNDS[cue]);
    players.set(cue, player);
  }
  void player.seekTo(0);
  player.play();
}

function vibrate(pattern: number[]) {
  const [single] = pattern;
  if (pattern.length === 1 && single !== undefined) {
    Vibration.vibrate(single);
    return;
  }
  // React Native's Android pattern starts with a pause; the web one with a vibration.
  Vibration.vibrate(Platform.OS === 'web' ? pattern : [0, ...pattern]);
}

export function playCue(cue: Cue): void {
  const pattern = VIBRATIONS[cue];
  if (pattern) vibrate(pattern);
  try {
    playSound(cue);
  } catch {
    // Sound is a second channel: the screen and the vibration still carry the cue.
  }
}
