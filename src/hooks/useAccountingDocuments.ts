import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import { DocumentValue } from '../components/bookings/checklist/ChecklistItemModel';
import safeInvoke from '../utilities/safeInvoke';
import { update } from 'lodash/fp';

export default function useAccountingDocuments(bookingId: string) {
  let query = useCallback(q => q.orderBy('uploadedAt', 'asc'), []);

  const accountingDocumentsCollection = useFirestoreCollection('bookings', query, bookingId, 'accounting-documents');

  return accountingDocumentsCollection?.docs.map(doc => {
    return update('uploadedAt', safeInvoke('toDate'))({ id: doc.id, ...doc.data() } as DocumentValue);
  }) as DocumentValue[];
}
