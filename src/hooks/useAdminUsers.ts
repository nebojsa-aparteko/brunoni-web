import { useCallback } from 'react';

import UserRecord, { ADMIN_ROLES } from '../model/UserRecord';
import useFirestoreCollection from './useFirestoreCollection';

export default function useAdminUsers() {
  const query = useCallback(q => q.where('role', 'in', ADMIN_ROLES), []); //'isAdmin', '==', true), []);

  const usersCollection = useFirestoreCollection('users', query);

  return usersCollection?.docs.map(doc => doc.data()) as UserRecord[];
}
