import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import UserRecord from '../model/UserRecord';

export default function useClientUsers(alphacomClientId: string) {
  const query = useCallback(q => q.where('alphacomClientId', '==', alphacomClientId), [alphacomClientId]);
  const snapshot = useFirestoreCollection('users', alphacomClientId ? query : null);

  return snapshot?.docs
    .map(doc => {
      return { id: doc.id, ...doc.data() } as UserRecord;
    })
    .filter(c => !c.archived);
}
