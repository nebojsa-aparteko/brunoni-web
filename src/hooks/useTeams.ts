import { useMemo } from 'react';
import firebase from '../firebase';
import useFirestoreCollection from './useFirestoreCollection';
import { Team, TeamType } from '../model/Teams';

export default function useTeams(type: TeamType | undefined = undefined) {
  const query = useMemo(
    () => (q: firebase.firestore.Query) => (type ? q.where('teamType', '==', type) : q),
    [type],
  );

  const teamsCollection = useFirestoreCollection('teams', query);

  return teamsCollection?.docs.map(doc => {
    return { id: doc.id, ...doc.data() } as Team;
  }) as Team[];
}
