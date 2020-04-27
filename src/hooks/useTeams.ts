import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import { Team } from '../model/Teams';

export default function useTeams() {
  const query = useCallback(q => q.orderBy('name', 'asc'), []);

  const teamsCollection = useFirestoreCollection('teams', query);

  return teamsCollection?.docs.map(doc => {
    return { id: doc.id, ...doc.data() } as Team;
  }) as Team[];
}
