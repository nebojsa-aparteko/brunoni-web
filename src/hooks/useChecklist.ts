import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import { ChecklistItem } from '../components/bookings/checklist/ChecklistItemModel';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import safeInvoke from '../utilities/safeInvoke';

const normalizedChecklistItems = map(
  flow(
    update('status', map(update('at', safeInvoke('toDate')))),
    // update('customerAction', update('at', safeInvoke.ts('toDate'))),
    update('values', map(update('uploadedAt', invoke('toDate')))),
    update('valuesAdmin', map(update('uploadedAt', invoke('toDate')))),
  ),
);

export default function useChecklist(bookingId: string) {
  const checklistCollection = useFirestoreCollection(
    'bookings',
    useCallback(query => query.orderBy('order', 'asc'), []),
    bookingId,
    'checklist',
  );

  return checklistCollection
    ? (normalizedChecklistItems(
        checklistCollection?.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChecklistItem)),
      ) as ChecklistItem[])
    : undefined;
}
