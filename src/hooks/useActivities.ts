import useFirestoreCollection from './useFirestoreCollection';
import { useMemo } from 'react';
import { normalizeActivity } from '../components/bookings/checklist/ActivityModel';
import firebase from '../firebase';

export default (
  path: string,
  query?: (collection: firebase.firestore.Query) => firebase.firestore.Query<firebase.firestore.DocumentData>,
) => {
  const activityCollection = useFirestoreCollection(path, query);

  return useMemo(
    () => activityCollection?.docs.map(doc => ({ id: doc.id, path: doc.ref.path, ...normalizeActivity(doc.data()) })),
    [activityCollection?.docs, activityCollection?.docs.length],
  );
};
