import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import UserRecord from '../model/UserRecord';

export default function useUserByAlphacomId(id?: string) {
  const query = useCallback(q => (id ? q.where('alphacomId', '==', id) : q.where('alphacomId', '==', '')), [id]);

  const clientDocs = useFirestoreCollection('users', query);

  return clientDocs?.docs[0] as UserRecord | null | undefined;
}
