import { useCallback, useContext } from 'react';

import UserRecord from '../contexts/UserRecordContext';
import useFirestoreCollection from './useFirestoreCollection';

import firebase from '../firebase';
import Client from '../model/Client';

export default function useClients() {
  const userRecord = useContext(UserRecord);

  const query = useCallback(
    q =>
      userRecord?.isAdmin
        ? q
        : q.where(firebase.firestore.FieldPath.documentId(), '==', userRecord?.alphacomClientId || ''),
    [userRecord],
  );

  const clientsCollection = useFirestoreCollection('clients', query);

  return clientsCollection?.docs.map(doc => doc.data()) as Client[];
}
