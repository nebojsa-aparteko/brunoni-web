import useFirestoreCollection from './useFirestoreCollection';
import ProviderProfitEntity, {
  DefaultProviderProfitEntity,
  isDefaultProviderProfitEntity,
  isSpecificProviderProfitEntity,
  SpecificProviderProfitEntity,
} from '../model/land-transport/providers/ProviderProfit';

const useLandTransportProfits = (providerId: string) => {
  const landTransportProfitsRef = useFirestoreCollection(`land-transport-config/${providerId}/profit`);
  return landTransportProfitsRef?.docs
    .map(
      v =>
        ({
          ...v.data(),
          id: v.id,
        } as ProviderProfitEntity),
    )
    .reduce(
      (previousValue, currentValue) => {
        if (isDefaultProviderProfitEntity(currentValue)) {
          previousValue.defaultProfit.push(currentValue);
        } else if (isSpecificProviderProfitEntity(currentValue)) {
          previousValue.specificProfit.push(currentValue);
        }
        return previousValue;
      },
      { defaultProfit: [] as DefaultProviderProfitEntity[], specificProfit: [] as SpecificProviderProfitEntity[] },
    ) as { defaultProfit: DefaultProviderProfitEntity[]; specificProfit: SpecificProviderProfitEntity[] };
};

export default useLandTransportProfits;
