import ProviderEntity from '../model/land-transport/providers/Provider';
import { flow, update } from 'lodash/fp';
import normalizeFirestoreDate from '../utilities/normalizeFirestoreDate';
import useFirestoreDocument from './useFirestoreDocument';

const useLandTransportProvider = (providerId: string) => {
  const landTransportProvidersRef = useFirestoreDocument(`land-transport-config`, providerId);
  console.log(landTransportProvidersRef?.data());
  return flow(update('createdAt', normalizeFirestoreDate))({
    ...landTransportProvidersRef?.data(),
    id: landTransportProvidersRef?.id,
  }) as ProviderEntity;
};

export default useLandTransportProvider;
