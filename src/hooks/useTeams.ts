import { useMemo } from 'react';
import firebase from 'firebase';
import useFirestoreCollection from './useFirestoreCollection';
import { GroupType, Team, TeamType } from '../model/Teams';

export default function useTeams(type?: TeamType, groupType?: GroupType) {
  const query = useMemo(
    () => (q: firebase.firestore.Query) => {
      let query = q;
      if (type) query = query.where('teamType', '==', type);
      if (groupType) query = query.where('groupType', '==', groupType);
      return query;
    },
    [groupType, type],
  );

  const teamsCollection = useFirestoreCollection('teams', query);

  return teamsCollection?.docs.map(doc => {
    return { id: doc.id, ...doc.data() } as Team;
  }) as Team[];
}
