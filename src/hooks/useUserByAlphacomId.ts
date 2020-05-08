import { useContext } from 'react';

import UserRecordsContext from '../contexts/UserRecordsContext';

export default function useUserByAlphacomId(id?: string) {
  const users = useContext(UserRecordsContext);
  return id ? users?.find(user => user.alphacomId === id) : undefined;
  // const query = useCallback(q => (id ? q.where('alphacomId', '==', id) : q), [id]);
  //
  // const clientDocs = useFirestoreCollection('users', id ? query : undefined);
  //
  // const doc = clientDocs?.docs[0];
  //
  // return doc?.data() as UserRecord | null | undefined;
}
