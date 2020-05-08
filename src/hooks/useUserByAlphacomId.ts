import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import UserRecord from '../model/UserRecord';

export default function useUserByAlphacomId(id?: string) {
  const query = useCallback(q => (id ? q.where('alphacomId', '==', id) : q), [id]);

  const clientDocs = useFirestoreCollection('users', id ? query : undefined);

  const doc = clientDocs?.docs[0];

  return doc?.data() as UserRecord | null | undefined;
}
