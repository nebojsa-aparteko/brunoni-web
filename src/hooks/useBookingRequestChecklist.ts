import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import { ChecklistItem } from '../components/bookings/checklist/ChecklistItemModel';

export default function useBookingRequestChecklist(bookingRequestId: string) {
  const checklistCollection = useFirestoreCollection(
    'bookings-requests',
    useCallback(query => query.orderBy('order', 'asc'), []),
    bookingRequestId,
    'checklist',
  );
  return checklistCollection
    ? (checklistCollection?.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChecklistItem)) as ChecklistItem[])
    : undefined;
}
