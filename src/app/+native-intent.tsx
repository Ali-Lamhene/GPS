import { isShareLink } from '@/domain/share-link';
import { keepPendingLink } from '@/features/traveller/receive/pending-link';

// Every link that opens the app goes through here first (securite.md §3): only a place link
// reaches its screen, which validates it, and it is read once from here. Any other link
// changes nothing when the app is already open (a trip in progress stays), and opens the
// home when it starts the app.
export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string | null {
  if (isShareLink(path)) {
    keepPendingLink(path);
    return '/gps/lieu';
  }
  return initial ? '/' : null;
}
