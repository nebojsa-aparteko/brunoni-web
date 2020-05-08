import { useContext, useMemo } from 'react';

import UserRecord from '../contexts/UserRecordContext';
import useFirestoreDocument from './useFirestoreDocument';
import Client from '../model/Client';
import useClients from './useClients';

export default function useClient() {
  const userRecord = useContext(UserRecord);
  return userRecord?.company;
}

export function useClientById(id?: string) {
  const clientDoc = useFirestoreDocument('clients', id);

  return clientDoc?.data() as Client;
}

export function useClientByIdFromCache(clientId?: string) {
  const clients = useClients();
  const client = useMemo(() => (clientId ? clients?.find(client => client.id === clientId) : undefined), [
    clients,
    clientId,
  ]);

  return client;
}
