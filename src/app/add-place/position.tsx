import { PositionScreen } from '@/features/traveller/add-place/position-screen';
import { RequireDraft } from '@/features/traveller/add-place/require-draft';

export default function PositionRoute() {
  return (
    <RequireDraft source="position">
      <PositionScreen />
    </RequireDraft>
  );
}
