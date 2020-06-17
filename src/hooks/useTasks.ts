import { useEffect, useMemo, useState } from 'react';

import useFirestoreCollection, { QueryFunction } from './useFirestoreCollection';
import { flow, update, identity } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';
import VesselWithVoyage from '../model/VesselWithVoyage';
import firebase from '../firebase';
import { useVesselFilterContext } from '../providers/VesselOverviewFilterProvider';
import pick from 'lodash/fp/pick';
import { UserRecordMinProperties } from '../model/UserRecord';
import Task from '../model/Task';

export default function useTasks() {
  const [snapshot, setSnapshot] = useState<Task[] | undefined>();

  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      let query = collection.where('resolved', '==', false).orderBy('dueDate', 'asc');

      return query;
    },
    [],
  );

  useEffect(() => {
    const cleanup = (async () => {
      try {
        const collectionReference = firebase.firestore().collectionGroup('tasks');

        const collection = await ((query || identity)(collectionReference) as any);
        return collection.onSnapshot({
          complete: () => console.log('Collection group for Tasks completed'),
          error: (error: any) => console.error('Collection group for Tasks threw an error', error),
          next: (snapshot: any) => {
            console.debug('Collection group for Tasks', 'updated with', snapshot);
            setSnapshot(
              snapshot.docs.map((d: any) => ({
                ...normalizeTaskData(d.data()),
                bookingId: d.ref.parent.parent?.id,
                id: d.id,
              })) as Task[],
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
  }, [query, setSnapshot]);

  return snapshot;
}

export const normalizeTaskData = (item: any) => flow(update('dueDate', safeInvoke('toDate')))(item) as Task;
