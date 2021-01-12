import { useContext, useEffect, useMemo, useState } from 'react';
import { flow, identity, update } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';
import firebase from '../firebase';
import Task, { UserRole } from '../model/Task';
import { useTaskFilterProviderContext } from '../providers/TaskFilterProvider';
import pick from 'lodash/fp/pick';
import { UserRecordMinProperties } from '../model/UserRecord';
import ActingAs from '../contexts/ActingAs';
import UserRecordContext from '../contexts/UserRecordContext';
import { formatCarrierId } from '../components/myDay/MyDayContainer';

export default function useTasks() {
  const [snapshot, setSnapshot] = useState<Task[] | undefined>();
  const [filters] = useTaskFilterProviderContext();
  const { assignee, showClientTasks, taskCategory, carrier, payDate } = filters;
  const [actingAs] = useContext(ActingAs);
  const userRecord = useContext(UserRecordContext);

  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      let query = collection.where('resolved', '==', false).where('show', '==', true);
      if (taskCategory) {
        query = query.where('taskCategory', '==', taskCategory);
      }
      if (carrier) {
        query = query.where('carrierId', '==', formatCarrierId(carrier.id));
      }
      if (payDate) {
        query = query.where('payDate', '==', payDate);
      }
      if (assignee) {
        query = query.where('assignedUser', '==', pick(UserRecordMinProperties)(assignee));
      }
      if (!actingAs && !showClientTasks) {
        query = query.where('userRole', '==', UserRole.ADMIN);
      }
      if (actingAs) {
        query = query.where('assignedUser', '==', pick(UserRecordMinProperties)(userRecord));
      }
      return query;
    },
    [assignee, showClientTasks, actingAs, userRecord, taskCategory, carrier, payDate],
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
  }, [query, setSnapshot]);

  return snapshot;
}

export const normalizeTaskData = (item: any) =>
  flow(update('dueDate', safeInvoke('toDate')), update('payDate', safeInvoke('toDate')))(item) as Task;
