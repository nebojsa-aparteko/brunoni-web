import { useEffect, useMemo, useState } from 'react';

import useFirestoreCollection, { QueryFunction } from './useFirestoreCollection';
import { flow, update, identity } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';
import VesselWithVoyage from '../model/VesselWithVoyage';
import firebase from '../firebase';
import { useVesselFilterContext } from '../providers/VesselOverviewFilterProvider';
import pick from 'lodash/fp/pick';
import { UserRecordMinProperties } from '../model/UserRecord';

export default function useVesselWithVoyage() {
  const [snapshot, setSnapshot] = useState<VesselWithVoyage[] | undefined>();
  const [filters, _] = useVesselFilterContext();
  const { category, carrier } = filters;
  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      // setIsLoading(true);

      let query = collection.where('ets', '>', new Date());

      if (category) {
        query = query.where('category', '==', category);
      }

      if (carrier) {
        query = query.where('carrier', '==', carrier.id);
      }

      return query;
    },
    [carrier, category, filters],
  );

  useEffect(() => {
    const cleanup = (async () => {
      try {
        const collectionReference = firebase.firestore().collectionGroup('vesVoyCollection');
        // .where('ets', '>', new Date())
        // .where('category', '==', category);

        const collection = await ((query || identity)(collectionReference) as any);
        return collection.onSnapshot({
          complete: () => console.log('Collection group for Voyage and Vessel completed'),
          error: (error: any) => console.error('Collection group for Voyage and Vessel threw an error', error),
          next: (snapshot: any) => {
            console.debug('Collection group for Voyage and Vessel', 'updated with', snapshot);
            setSnapshot(
              snapshot.docs.map((d: any) => ({
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
  }, [query, setSnapshot, filters]);

  return snapshot;
}

export const normalizeVesselData = (item: any) =>
  flow(update('ets', safeInvoke('toDate')), update('eta', safeInvoke('toDate')))(item) as VesselWithVoyage;
