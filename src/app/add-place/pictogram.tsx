import { PictogramScreen } from '@/features/traveller/add-place/pictogram-screen';
import { RequireDraft } from '@/features/traveller/add-place/require-draft';

export default function PictogramRoute() {
  return (
    <RequireDraft>
      <PictogramScreen />
    </RequireDraft>
  );
}
