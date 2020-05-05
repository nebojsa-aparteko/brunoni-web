import { useCallback } from 'react';

import UserRecord, { ADMIN_ROLES } from '../model/UserRecord';
import useFirestoreCollection from './useFirestoreCollection';

export default function useAdminUsers(roles: string[] = ADMIN_ROLES) {
  const query = useCallback(q => q.where('role', 'in', roles).orderBy('firstName', 'asc'), [roles]); //'isAdmin', '==', true), []);

  const usersCollection = useFirestoreCollection('users', query);

  return usersCollection?.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserRecord)) as UserRecord[];
}
