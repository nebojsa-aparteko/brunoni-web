import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import { ChecklistItem } from '../components/bookings/checklist/ChecklistItemModel';

export default function useBookingRequestChecklist(bookingRequestId: string, checklistId?: string) {
  const checklistCollection = useFirestoreCollection(
    'bookings-requests',
    useCallback(query => query.orderBy('order', 'asc'), []),
    bookingRequestId,
    'checklist',
  );
  if (!checklistCollection) return undefined;

  const checklist = checklistCollection?.docs.map(
    doc => ({ id: doc.id, ...doc.data() } as ChecklistItem),
  ) as ChecklistItem[];

  if (checklistId) {
    const item = checklist.find(e => e.id === checklistId);
    if (!item) return undefined;
    return [item];
  }
  return checklist;
}
