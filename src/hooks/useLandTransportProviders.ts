import useFirestoreCollection from './useFirestoreCollection';
import ProviderEntity from '../model/land-transport/providers/Provider';
import { flow, update } from 'lodash/fp';
import normalizeFirestoreDate from '../utilities/normalizeFirestoreDate';

const useLandTransportProviders = () => {
  const landTransportProvidersRef = useFirestoreCollection('land-transport-config');
  return landTransportProvidersRef?.docs.map(v =>
    flow(update('createdAt', normalizeFirestoreDate))({
      ...v.data(),
      id: v.id,
    } as ProviderEntity),
  );
};

export default useLandTransportProviders;
