import useFirestoreCollection from './useFirestoreCollection';
import { flow, update } from 'lodash/fp';
import normalizeFirestoreDate from '../utilities/normalizeFirestoreDate';
import { ProviderExtensionEntity } from '../model/land-transport/providers/ProviderConfig';

const useLandTransportExtensionConfig = (providerId: string, name?: string) => {
  const landTransportExtensionsRef = useFirestoreCollection(
    `land-transport-config/${providerId}/extension-config`,
  );
  return landTransportExtensionsRef?.docs.map(v =>
    flow(update('createdAt', normalizeFirestoreDate))({
      ...v.data(),
      ...(name ? { providerName: name } : {}),
      id: v.id,
    } as ProviderExtensionEntity),
  );
};

export default useLandTransportExtensionConfig;
