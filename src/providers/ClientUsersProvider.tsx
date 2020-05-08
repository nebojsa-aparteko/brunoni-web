import React, { useCallback, useMemo } from 'react';

import UserRecord from '../model/UserRecord';
import UserRecordsContext from '../contexts/UserRecordsContext';
import useUser from '../hooks/useUser';
import useFirestoreCollection from '../hooks/useFirestoreCollection';

interface Props {
  children: React.ReactNode;
}

const ClientUsersProvider: React.FC<Props> = ({ children }) => {
  const userRecord = useUser()[1];
  const query = useCallback(q => (userRecord ? q.where('alphacomClientId', '==', userRecord.alphacomClientId) : q), [
    userRecord,
  ]);

  const snapshot = useFirestoreCollection('users', userRecord ? query : undefined);

  const userRecords = useMemo(() => {
    return snapshot?.docs.map(doc => {
      return { id: doc.id, ...doc.data() } as UserRecord;
    }) as UserRecord[];
  }, [snapshot]);

  return <UserRecordsContext.Provider value={userRecords}>{children}</UserRecordsContext.Provider>;
};

export default ClientUsersProvider;
