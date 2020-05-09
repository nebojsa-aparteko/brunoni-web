import { useContext } from 'react';

import { ADMIN_ROLES } from '../model/UserRecord';
import UserRecordsContext from '../contexts/UserRecordsContext';

export default function useAdminUsers(roles: string[] = ADMIN_ROLES) {
  const users = useContext(UserRecordsContext);

  return users
    ? users.filter(user => roles.indexOf(user.role!) !== -1).sort((a, b) => (a.firstName! >= b.firstName! ? 1 : -1))
    : [];
}
