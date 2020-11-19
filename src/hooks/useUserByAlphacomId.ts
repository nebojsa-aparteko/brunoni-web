import { useContext } from 'react';

import UserRecordsContext from '../contexts/UserRecordsContext';

export default function useUserByAlphacomId(id?: string) {
  const users = useContext(UserRecordsContext);
  return id ? users?.find(user => user.alphacomId === id && !user.archived) : undefined;
}
