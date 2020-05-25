import { useEffect, useState } from 'react';

import useFirestoreCollection, { QueryFunction } from './useFirestoreCollection';
import { flow, update } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';
import VesselWithVoyage from '../model/VesselWithVoyage';
import firebase from '../firebase';

export default function useVesselWithVoyage(filter: string = 'Export', query?: QueryFunction | null) {
  const [snapshot, setSnapshot] = useState<VesselWithVoyage[] | undefined>();

  useEffect(() => {
    // if (query === null) {
    //   setSnapshot(undefined);
    //   return;
    // }

    const cleanup = (async () => {
      try {
        console.log(filter, ' FILTER');
        const collectionReference = firebase
          .firestore()
          .collectionGroup('vesVoyCollection')
          .where('ets', '>', new Date())
          .where('category', '==', filter);

        // const collection = await ((query || identity)(collectionReference) as any).get();
        return collectionReference.onSnapshot({
          complete: () => console.log('Collection group for Voyage and Vessel completed'),
          error: error => console.error('Collection group for Voyage and Vessel threw an error', error),
          next: snapshot => {
            console.debug('Collection group for Voyage and Vessel', 'updated with', snapshot);
            setSnapshot(
              snapshot.docs.map(d => ({
                ...normalizeVesselData(d.data()),
                vesselWithVoyage: d.ref.parent.parent?.id,
              })) as VesselWithVoyage[],
            );
          },
        });
      } catch (error) {
        console.error('useFirestoreCollection threw an error', error);
        return null;
      }
    })();

    return () => {
      if (cleanup) {
        cleanup
          .then(result => {
            if (result) result();
          })
          .catch(error => console.error('cleanup error', error));
      }
    };
  }, [query, setSnapshot, filter]);

  return snapshot;
}

export const normalizeVesselData = (item: any) =>
  flow(update('ets', safeInvoke('toDate')), update('eta', safeInvoke('toDate')))(item) as VesselWithVoyage;
