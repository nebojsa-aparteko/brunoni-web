import { useContext } from 'react';

import ClientsContext from '../contexts/ClientsContext';

export default function useClients() {
  const clients = useContext(ClientsContext);
  return clients;
}
