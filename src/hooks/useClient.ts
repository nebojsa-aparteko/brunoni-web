import { useContext } from 'react';

import UserRecord from '../contexts/UserRecord';
import useFirestoreDocument from './useFirestoreDocument';
import Client from '../model/Client';

export default function useClient() {
  const userRecord = useContext(UserRecord);

  const clientDoc = useFirestoreDocument('clients', userRecord?.alphacomClientId);

  return clientDoc?.data() as Client;
}
