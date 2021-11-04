import useFirestoreCollection from './useFirestoreCollection';
import ProviderEntity from '../model/land-transport/providers/Provider';

const useLandTransportProviders = () => {
  const landTransportProvidersRef = useFirestoreCollection('land-transport-config');
  return landTransportProvidersRef?.docs.map(
    v =>
      ({
        ...v.data(),
        id: v.id,
      } as ProviderEntity),
  );
};

export default useLandTransportProviders;
