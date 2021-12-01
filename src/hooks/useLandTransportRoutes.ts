import useFirestoreCollection from './useFirestoreCollection';
import { flow, update } from 'lodash/fp';
import normalizeFirestoreDate from '../utilities/normalizeFirestoreDate';
import ProviderRouteEntity, { ProviderRoutesType } from '../model/land-transport/providers/ProviderRoutes';
import { useCallback } from 'react';

const useLandTransportRoutes = <T extends ProviderRouteEntity>(providerId: string, type: ProviderRoutesType) => {
  const landTransportRoutesRef = useFirestoreCollection(
    'land-transport-config',
    useCallback(
      collection => {
        return collection.where('type', '==', type);
      },
      [type],
    ),
    providerId,
    'routes',
  );
  return landTransportRoutesRef?.docs.map(v =>
    flow(
      update('createdAt', normalizeFirestoreDate),
      update('updatedAt', normalizeFirestoreDate),
      update('validity.startDate', normalizeFirestoreDate),
      update('validity.endDate', normalizeFirestoreDate),
    )({
      ...v.data(),
      id: v.id,
    } as T),
  );
};

export default useLandTransportRoutes;
