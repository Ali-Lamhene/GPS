import { Linking } from 'react-native';

import { CREDIT_PAGES } from './hosts';

export type CreditPage = keyof typeof CREDIT_PAGES;

/**
 * Opens a credit page in the phone's browser (spec 024): companion area only, after a
 * touch. No browser, or it fails: nothing happens, the credit text stays.
 */
export function openCreditPage(page: CreditPage): void {
  Linking.openURL(CREDIT_PAGES[page]).catch(() => undefined);
}
