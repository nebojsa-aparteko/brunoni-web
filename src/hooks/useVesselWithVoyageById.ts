import useFirestoreDocument from './useFirestoreDocument';
import VesselAllocation from '../model/VesselAllocation';
import { useMemo } from 'react';

export default (id: string) => {
  const vessel = useFirestoreDocument('vesselWithVoyage', id);

  return useMemo(() => vessel?.data() as VesselAllocation | undefined, [vessel]);
};
