import useFirestoreDocument from './useFirestoreDocument';
import VesselAllocation from '../model/VesselAllocation';

export default (id: string) => {
  const vessel = useFirestoreDocument('vesselWithVoyage', id);

  return vessel?.data() as VesselAllocation;
};
