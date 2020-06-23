import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import Task from '../model/Task';
import { flow, update } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';

export default function useTasksPerBooking(bookingId: string) {
  const tasksCollection = useFirestoreCollection(
    'bookings',
    useCallback(query => query.orderBy('resolved', 'desc'), []),
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
