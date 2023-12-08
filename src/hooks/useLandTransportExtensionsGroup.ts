import { flow, update } from 'lodash/fp';
import normalizeFirestoreDate from '../utilities/normalizeFirestoreDate';
import useFirestoreCollection from './useFirestoreCollection';
import { ProviderExtensionGroupEntity } from '../model/land-transport/providers/ProviderConfig';

const useLandTransportExtensionsGroup = (providerId: string, routeId: string) => {
  const landTransportProviderExtensionsGroupRef = useFirestoreCollection(
    `land-transport-config/${providerId}/routes/${routeId}/extensions-group`,
  );
  return landTransportProviderExtensionsGroupRef?.docs?.map(
    val =>
      flow(update('createdAt', normalizeFirestoreDate))({
        ...val?.data(),
        id: val?.id,
      }) as ProviderExtensionGroupEntity,
  );
};

export default useLandTransportExtensionsGroup;
