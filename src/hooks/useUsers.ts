import { useCallback, useContext } from 'react';

import useFirestoreCollection from './useFirestoreCollection';

import firebase from '../firebase';
import UserRecord, { isDashboardUser } from '../model/UserRecord';
import UserRecordContext from '../contexts/UserRecordContext';

export default function useUsers() {
  const userRecord = useContext(UserRecordContext);

  const query = useCallback(
    q =>
      isDashboardUser(userRecord)
        ? q
        : q.where(firebase.firestore.FieldPath.documentId(), '==', userRecord?.alphacomId || ''),
    [userRecord],
  );

  const usersCollection = useFirestoreCollection('users', query);

  return usersCollection?.docs.map(doc => doc.data()) as UserRecord[];
}
