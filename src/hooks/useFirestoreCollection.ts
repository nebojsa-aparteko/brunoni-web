import { useEffect, useState } from 'react';
import identity from 'lodash/fp/identity';
import firebase from '../firebase';

export type QueryFunction = (collection: firebase.firestore.CollectionReference) => firebase.firestore.Query;

export default function useFirestoreCollection(name: string, query?: QueryFunction | null) {
  const [snapshot, setSnapshot] = useState<firebase.firestore.QuerySnapshot | undefined>();

  useEffect(() => {
    if (query === null) {
      setSnapshot(undefined);
      return;
    }

    (async () => {
      try {
        const collection = await ((query || identity)(firebase.firestore().collection(name)) as any).get();

        return collection.query.onSnapshot({
          complete: () => {
            console.log('useFirestoreCollection', name, 'completed');
          },
          error: (error: firebase.firestore.FirestoreError) => {
            console.error('useFirestoreCollection', name, 'threw an error', error);
          },
          next: (snapshot: firebase.firestore.QuerySnapshot) => {
            console.debug('useFirestoreCollection', name, 'updated with', snapshot);
            setSnapshot(snapshot);
          },
        });
      } catch (error) {
        console.error('useFirestoreCollection', name, 'threw an error', error);
      }
    })();
  }, [name, query]);

  return snapshot;
}
