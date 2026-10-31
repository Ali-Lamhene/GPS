import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

// Reads aloud a station name or the help card (the two spoken exceptions of
// docs/screens.md, rule 2). A network voice would send the text, so part of the trip, to
// the speech engine's servers (D1): the app only speaks with a voice it knows is on the
// phone, and stays silent otherwise.

function isLocalFrenchVoice(voice: Speech.Voice): boolean {
  if (!voice.language.toLowerCase().startsWith('fr')) return false;
  switch (Platform.OS) {
    case 'ios':
      // AVSpeechSynthesizer only lists voices installed on the phone.
      return true;
    case 'android':
      // Google's engine names its offline voices "…-local"; other engines are not trusted.
      return voice.identifier.endsWith('-local');
    default:
      // Browsers flag remote voices (e.g. Chrome's Google voices) with localService false.
      return 'localService' in voice && voice.localService === true;
  }
}

/** Looked up at every call: a voice can be uninstalled while the app runs. */
async function findLocalFrenchVoice(): Promise<string | undefined> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.find(isLocalFrenchVoice)?.identifier;
  } catch {
    return undefined;
  }
}

/** Speaks `text` and returns true, or returns false when no local voice can do it. */
export async function speak(text: string): Promise<boolean> {
  void Speech.stop();
  const voice = await findLocalFrenchVoice();
  if (!voice) return false;
  Speech.speak(text, { language: 'fr-FR', voice });
  return true;
}
