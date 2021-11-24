import useFirestoreCollection from './useFirestoreCollection';
import {
  AddOnOfferProviderConfig,
  IncludedOfferProviderConfig,
  isAddOnProviderProfitEntity,
  isIncludedProviderProfitEntity,
  OfferProviderConfig,
} from '../model/land-transport/providers/ProviderConfig';

const useLandTransportExtensions = (providerId: string) => {
  const landTransportExtensionsRef = useFirestoreCollection(`land-transport-config/${providerId}/extensions`);
  return landTransportExtensionsRef?.docs
    .map(
      v =>
        ({
          ...v.data(),
          id: v.id,
        } as OfferProviderConfig),
    )
    .reduce(
      (previousValue, currentValue) => {
        if (isIncludedProviderProfitEntity(currentValue)) {
          previousValue.included.push(currentValue);
        } else if (isAddOnProviderProfitEntity(currentValue)) {
          previousValue.addOn.push(currentValue);
        }
        return previousValue;
      },
      { included: [] as IncludedOfferProviderConfig[], addOn: [] as AddOnOfferProviderConfig[] },
    ) as { included: IncludedOfferProviderConfig[]; addOn: AddOnOfferProviderConfig[] };
};

export default useLandTransportExtensions;
