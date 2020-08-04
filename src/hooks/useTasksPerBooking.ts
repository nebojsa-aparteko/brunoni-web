import { useCallback, useContext } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import Task, { UserRole } from '../model/Task';
import { flow, update } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';
import ActingAs from '../contexts/ActingAs';

export default function useTasksPerBooking(bookingId: string) {
  const [actingAs] = useContext(ActingAs);

  const tasksCollection = useFirestoreCollection(
    'bookings',
    useCallback(
      query => {
        let q = query;
        if (actingAs) {
          q = q.where('userRole', '==', UserRole.CLIENT);
        }
        return q.orderBy('resolved', 'asc');
      },
      [actingAs],
    ),
    bookingId,
    'tasks',
  );

  return tasksCollection
    ? (tasksCollection?.docs.map(
        doc => ({ ...normalizeTaskData(doc.data()), bookingId: doc.ref.parent.parent?.id, id: doc.id } as Task),
      ) as Task[])
    : undefined;
}

export const normalizeTaskData = (item: any) => flow(update('dueDate', safeInvoke('toDate')))(item) as Task;
