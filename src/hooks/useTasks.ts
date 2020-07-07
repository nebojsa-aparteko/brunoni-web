import { useEffect, useMemo, useState } from 'react';
import { flow, identity, update } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';
import firebase from '../firebase';
import Task, { UserRole } from '../model/Task';
import { useTaskFilterProviderContext } from '../providers/TaskFilterProvider';
import pick from 'lodash/fp/pick';
import { UserRecordMinProperties } from '../model/UserRecord';

export default function useTasks() {
  const [snapshot, setSnapshot] = useState<Task[] | undefined>();
  const [filters, _] = useTaskFilterProviderContext();
  const { assignee, showClientTasks } = filters;
  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      let query = collection.where('resolved', '==', false).where('show', '==', true);
      if (assignee) {
        query = query.where('assignedUser', '==', pick(UserRecordMinProperties)(assignee));
      }
      if (!showClientTasks) {
        query = query.where('userRole', '==', UserRole.ADMIN);
      }
      query.limit(100);
      return query;
    },
    [filters, assignee, UserRecordMinProperties, pick, showClientTasks],
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
                selected: false,
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
  }, [query, setSnapshot, normalizeTaskData]);

  return snapshot;
}

export const normalizeTaskData = (item: any) => flow(update('dueDate', safeInvoke('toDate')))(item) as Task;
