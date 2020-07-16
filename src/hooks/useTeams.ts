import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import { Team } from '../model/Teams';
import { UserRecordMin } from '../model/UserRecord';

export default function useTeams(user: UserRecordMin | undefined = undefined) {
  let query = useCallback(q => (user ? q.where('users', 'array-contains', user) : q).orderBy('name', 'asc'), [user]);

  const teamsCollection = useFirestoreCollection('teams', query);

  return teamsCollection?.docs.map(doc => {
    return { id: doc.id, ...doc.data() } as Team;
  }) as Team[];
}
