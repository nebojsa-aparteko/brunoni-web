import useFirestoreCollection from './useFirestoreCollection';
import ProviderProfitEntity from '../model/land-transport/providers/ProviderProfit';

const useLandTransportProfits = (providerId: string) => {
  const landTransportProfitsRef = useFirestoreCollection(`land-transport-config/${providerId}/profit`);
  return landTransportProfitsRef?.docs.map(
    v =>
      ({
        ...v.data(),
        id: v.id,
      } as ProviderProfitEntity),
  );
};

export default useLandTransportProfits;
