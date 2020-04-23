import { useCallback, useContext } from 'react';

import UserRecord from '../model/UserRecord';
import useFirestoreCollection from './useFirestoreCollection';

export default function useAdminUsers() {
  const query = useCallback(q => q.where('isAdmin', '==', true), []);

  const usersCollection = useFirestoreCollection('users', query);

  return usersCollection?.docs.map(doc => doc.data()) as UserRecord[];
}
