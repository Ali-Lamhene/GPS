import { PlacesScreen } from '@/features/social-worker/places-screen';
import { RequireDraft } from '@/features/traveller/add-place/require-draft';

// Only from the companion's address screen (D8): never opened by a link (securite.md §3).
export default function PlacesRoute() {
  return (
    <RequireDraft source="address">
      <PlacesScreen />
    </RequireDraft>
  );
}
