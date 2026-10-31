import { MaterialSymbolsRounded_400Regular } from '@expo-google-fonts/material-symbols-rounded/400Regular';
import { MaterialSymbolsRounded_400Regular_Filled } from '@expo-google-fonts/material-symbols-rounded/400Regular_Filled';
import { Roboto_400Regular } from '@expo-google-fonts/roboto/400Regular';
import { Roboto_500Medium } from '@expo-google-fonts/roboto/500Medium';
import { Roboto_600SemiBold } from '@expo-google-fonts/roboto/600SemiBold';
import { Roboto_700Bold } from '@expo-google-fonts/roboto/700Bold';
import { useFonts } from 'expo-font';

// One family name per face, so weights work the same on every platform.
// Fonts ship inside the app: nothing is fetched from Google at runtime (D1).
export const fontFamilies = {
  regular: 'Roboto-Regular',
  medium: 'Roboto-Medium',
  semiBold: 'Roboto-SemiBold',
  bold: 'Roboto-Bold',
  icon: 'MaterialSymbolsRounded',
  iconFilled: 'MaterialSymbolsRounded-Filled',
} as const;

export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    [fontFamilies.regular]: Roboto_400Regular,
    [fontFamilies.medium]: Roboto_500Medium,
    [fontFamilies.semiBold]: Roboto_600SemiBold,
    [fontFamilies.bold]: Roboto_700Bold,
    [fontFamilies.icon]: MaterialSymbolsRounded_400Regular,
    [fontFamilies.iconFilled]: MaterialSymbolsRounded_400Regular_Filled,
  });
  // A font that fails to load falls back to the system font: better than a blank app.
  return loaded || error !== null;
}
