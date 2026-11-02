import { AddressScreen } from '@/features/social-worker/address-screen';
import { RequireDraft } from '@/features/traveller/add-place/require-draft';

export default function AddressRoute() {
  return (
    <RequireDraft source="address">
      <AddressScreen />
    </RequireDraft>
  );
}
