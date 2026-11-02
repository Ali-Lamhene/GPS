import { PhotoScreen } from '@/features/traveller/add-place/photo-screen';
import { RequireDraft } from '@/features/traveller/add-place/require-draft';

export default function PhotoRoute() {
  return (
    <RequireDraft>
      <PhotoScreen />
    </RequireDraft>
  );
}
