import { AutomaticProviderRoute } from '../model/land-transport/providers/ProviderRoutes';
import useFirestoreCollection from './useFirestoreCollection';

const useLandTransportRoutes = (providerId: string) => {
  const landTransportRoutesRef = useFirestoreCollection(`land-transport-config/${providerId}/routes`);
  if (!landTransportRoutesRef) return [];
  return landTransportRoutesRef.docs.map(v => v.data() as AutomaticProviderRoute);
};

export default useLandTransportRoutes;
