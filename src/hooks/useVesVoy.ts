import { useMemo } from 'react';
import useFirestoreCollection from './useFirestoreCollection';
import VesselWithVoyage from '../model/VesselWithVoyage';

export default (vesselWithVoyage: string) => {
  const vessel = useFirestoreCollection('vesselWithVoyage', undefined, vesselWithVoyage, 'vesVoyCollection');

  return useMemo(() => vessel?.docs?.map(doc => doc.data() as VesselWithVoyage | undefined), [vessel]);
};
